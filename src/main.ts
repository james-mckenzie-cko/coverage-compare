import * as core from '@actions/core'
import * as github from '@actions/github'
import {promisify} from 'util'
import childProcess from 'child_process'
import {getSummary} from './getCoverage'
import fs from 'fs'
import table from 'markdown-table'

import {S3} from 'aws-sdk'

const s3 = new S3()

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

export const generateTable = (base: any, compare: any) => {
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
    //get current
    const compareCoverage = getCoverageFile()

    const readStream = fs.createReadStream(
      'coverage-compare/coverage-summary.json'
    )

    s3.upload(
      {
        Bucket: 'cko-prism-frontend',
        Key: 'checks/coverage-summary.json',
        Body: readStream
      },
      (err, data) => {
        if (err) {
          console.log('Error', err)
        } else {
          console.log('Success', data)
        }
      }
    )

    //get base (from S3)

    // s3.getObject({Bucket: 'cko-prism-frontend', Key: 'checks/coverage-summary.json'}, (err, data) => {
    //   if (err) {
    //     console.log('Error', err)
    //   } else {
    //     console.log('Success', data)
    //   }
    // })

    // const baseCoverage = getCoverageFile()

    console.log(fs.readdirSync('./coverage-compare'))

    // const githubToken = core.getInput('githubToken', {required: true})

    // if (baseCoverage) {
    //   const table = generateTable(
    //     getSummary(baseCoverage),
    //     getSummary(compareCoverage)
    //   )

    //   const octokit = new github.GitHub(githubToken)

    //   const context = github.context

    //   const pullRequest = context.payload.pull_request

    //   if (pullRequest == null) {
    //     core.setFailed('No pull request found.')
    //     return
    //   }

    //   const pull_request_number = pullRequest.number

    //   await octokit.issues.createComment({
    //     ...context.repo,
    //     issue_number: pull_request_number,
    //     body: table
    //   })
    // }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
