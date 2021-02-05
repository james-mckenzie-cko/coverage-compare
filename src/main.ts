import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import table from 'markdown-table';

import { S3 } from 'aws-sdk';

const s3 = new S3();

const getCoverageFile = () => {
  try {
    return JSON.parse(
      fs.readFileSync('./coverage-compare/coverage-summary.json', 'utf8')
    );
  } catch (e) {
    console.log('no coverage file found on base branch');
    return undefined;
  }
};

const getSummary = (coverage: { total: { [k: string]: any } }) =>
  Object.keys(coverage.total).reduce((acc, curr, i) => {
    return {
      ...acc,
      [curr]: coverage.total[curr].pct
    };
  }, {});

const getSymbol = (val: number) => (val > 0 ? '📈' : val < 0 ? '📉' : '');

const generateTable = (base: any, compare: any) => {
  return table([
    ['', 'old', 'new', 'diff'],
    ...Object.keys(base).map(key => [
      key,
      `${base[key]}%`,
      `${compare[key]}%`,
      `${(compare[key] - base[key]).toFixed(2)}% ${getSymbol(
        compare[key] - base[key]
      )}`
    ])
  ]);
};

const uploadFile = (branch: string, filePath: string) => {
  const readStream = fs.createReadStream(filePath);

  return new Promise<S3.ManagedUpload.SendData>((resolve, reject) => {
    s3.upload(
      {
        Bucket: 'cko-prism-frontend',
        Key: `checks/${branch}/coverage-summary.json`,
        Body: readStream
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

const download = (branch: string) => {
  return new Promise<any>((resolve, reject) => {
    s3.getObject(
      {
        Bucket: 'cko-prism-frontend',
        Key: `checks/${branch}/coverage-summary.json`
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (data.Body) {
            resolve(JSON.parse(data.Body.toString()));
          }
        }
      }
    );
  });
};

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('githubToken', { required: true });

    const octokit = new github.GitHub(githubToken);

    const context = github.context;

    const pullRequest = context.payload.pull_request;

    if (pullRequest == null) {
      console.log('No pull request found. Skipping coverage comparison');

      console.log(
        '🚀 ~ file: main.ts ~ line 100 ~ run ~ context.ref ',
        context.ref
      );
      if (context.ref === 'refs/heads/master') {
        console.log('updating code coverage for master');

        await uploadFile('master', 'coverage-compare/coverage-summary.json');
      }
      return;
    }

    const compareCoverage = getCoverageFile();

    const baseCoverage = await download(
      process.env.GITHUB_BASE_REF!
    ).catch(err => console.log(err));

    if (baseCoverage) {
      const table = generateTable(
        getSummary(baseCoverage),
        getSummary(compareCoverage)
      );

      const pull_request_number = pullRequest.number;

      await octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number,
        body: table
      });
    } else {
      console.log('no base coverage found');
    }

    await uploadFile(
      process.env.GITHUB_HEAD_REF!,
      'coverage-compare/coverage-summary.json'
    );

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
