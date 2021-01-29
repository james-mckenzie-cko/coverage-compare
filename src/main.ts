import * as core from '@actions/core'
import * as github from '@actions/github'
import {promisify} from 'util'
import childProcess from 'child_process'
import {getSummary} from './getCoverage'
import fs from 'fs'
import table from 'markdown-table'

const exec = promisify(childProcess.exec)

const getCoverageFile = () => {
  try {
    return JSON.parse(
      fs.readFileSync('./coverage-compare/coverage-summary.json', 'utf8')
    )
  } catch (e) {
    console.log('no coverage file found on base branch')
    return undefined
  }
}

const getSymbol = (val: number) => (val > 0 ? '📈' : val < 0 ? '📉' : '')

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
  ])
}

async function run(): Promise<void> {
  try {
    // 1. on branch to compare
    // 2. get existing coverage summary
    // 	- get base branch name

    // 	- checkout base branch

    await exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`)

    console.log(
      '🚀 ~ file: main.ts ~ line 64 ~ run ~ process.env.GITHUB_BASE_REF',
      process.env.GITHUB_BASE_REF
    )

    console.log(
      '🚀 ~ file: main.ts ~ line 69 ~ run ~ process.env.GITHUB_HEAD_REF',
      process.env.GITHUB_HEAD_REF
    )

    // 	- get coverage summary

    const baseCoverage = getCoverageFile()

    // 3. get current coverage summary
    // 	- checkout compare branch

    await exec(`git checkout -f ${process.env.GITHUB_HEAD_REF}`)

    // 	- get coverage summary

    const compareCoverage = getCoverageFile()

    const githubToken = core.getInput('githubToken', {required: true})

    if (baseCoverage) {
      const table = generateTable(
        getSummary(baseCoverage),
        getSummary(compareCoverage)
      )

      // 4. comment on PR with coverage diff

      const octokit = new github.GitHub(githubToken)

      const context = github.context

      const pullRequest = context.payload.pull_request

      if (pullRequest == null) {
        core.setFailed('No pull request found.')
        return
      }

      const pull_request_number = pullRequest.number

      await octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number,
        body: table
      })
    }

    // 5. commit new coverage summary

    if (compareCoverage) {
      const remote = `https://${process.env.GITHUB_ACTOR}:${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`

      await exec('git config http.sslVerify false')
      await exec('git config --local user.name "Coverage"')
      await exec('git config --local user.email "coverage@bot.com"')
      await exec('git add -A')
      await exec('git commit -m "Updating code coverage summary"')
      await exec(`git push "${remote}" HEAD:"${process.env.GITHUB_HEAD_REF}"`)
    }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
