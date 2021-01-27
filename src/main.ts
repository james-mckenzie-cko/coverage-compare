import * as core from '@actions/core'
import * as github from '@actions/github'
import {promisify} from 'util'
import childProcess from 'child_process'
import {getSummary} from './getCoverage'
import fs from 'fs'
import table from 'markdown-table'

const exec = promisify(childProcess.exec)

const getCoverageFile = () => {
  let coverage
  try {
    coverage = JSON.parse(
      fs.readFileSync('./coverage-compare/coverage-summary.json', 'utf8')
    )
  } catch {
    console.log(`no coverage found for branch`)
  }

  return coverage
}

const x: any = {
  lines: 55.79,
  statements: 55.94,
  functions: 49.66,
  branches: 47.82
}
const y: any = {
  lines: 56.71,
  statements: 54.96,
  functions: 44.64,
  branches: 48.12
}

const compare = (base: any, compare: any) => {
  return table([
    ['', 'old', 'new', 'diff'],
    ...Object.keys(base).map(key => [
      key,
      `${base[key]}%`,
      `${compare[key]}`,
      `${(compare[key] - base[key]).toFixed(2)}% ${
        compare[key] - base[key] > 0 ? '📈' : '📉'
      }`
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

    // 	- get coverage summary

    const baseCoverage = getCoverageFile()

    // 3. get current coverage summary
    // 	- checkout compare branch

    await exec(`git checkout -f ${process.env.GITHUB_HEAD_REF}`)

    // 	- get coverage summary

    const compareCoverage = getCoverageFile()

    const table = compare(getSummary(baseCoverage), getSummary(compareCoverage))

    // 4. comment on PR with coverage diff

    const github_token = core.getInput('githubToken', {required: true})

    const octokit = new github.GitHub(github_token)

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

    // 5. commit new coverage summary

    await exec('git add coverage-compare')
    await exec('git commit -m "Updating code coverage summary"')
    await exec('git push')

    // const baseCoverage = getCoverageFile(baseBranchName)
    // console.log('baseCoverage', baseCoverage)

    // await exec(`git checkout -f ${currentBranchName}`)

    // const branchCoverage = getCoverageFile(currentBranchName)
    // console.log('branchCoverage', branchCoverage)

    // const baseSummary = baseCoverage && getSummary(baseCoverage)
    // console.log('baseSummary', baseSummary)
    // const branchSummary = branchCoverage && getSummary(branchCoverage)
    // console.log('branchSummary', branchSummary)

    // console.log('base', baseSummary)
    // console.log('base', branchSummary)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
