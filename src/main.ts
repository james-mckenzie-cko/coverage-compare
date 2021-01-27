import * as core from '@actions/core'
import {promisify} from 'util'
import childProcess from 'child_process'
import {getSummary} from './getCoverage'

const exec = promisify(childProcess.exec)

const getCoverageFile = () => {
  let coverage
  try {
    coverage = require('./coverage-compare/coverage-summary.json')
    console.log(
      '🚀 ~ file: main.ts ~ line 12 ~ getCoverageFile ~ coverage',
      coverage
    )
  } catch {
    console.log(`no coverage found for branch`)
  }

  return coverage
}

const getCurrentBranch = async () =>
  (await exec(`git rev-parse --abbrev-ref HEAD`)).stdout

async function run(): Promise<void> {
  try {
    // 1. on branch to compare
    // 2. get existing coverage summary
    // 	- get base branch name

    console.log('GITHUB_BASE_REF', process.env.GITHUB_BASE_REF)

    // 	- checkout base branch

    // await exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`)

    // 	- get coverage summary

    const baseCoverage = getCoverageFile()

    // 3. get current coverage summary
    // 	- checkout compare branch

    // await exec(`git checkout -f ${process.env.GITHUB_HEAD_REF}`)

    // 	- run tests with coverage

    // const {stdout} = await exec(
    //   `yarn test --coverage --coverageReporters="json-summary" coverageDirectory="coverage-compare"`
    // )
    // console.log('🚀 ~ file: main.ts ~ line 46 ~ run ~ stdout', stdout)

    // 	- get coverage summary

    const compareCoverage = getCoverageFile()
    console.log(
      '🚀 ~ file: main.ts ~ line 52 ~ run ~ compareCoverage',
      compareCoverage
    )
    console.log(
      '🚀 ~ file: main.ts ~ line 37 ~ run ~ baseCoverage',
      baseCoverage
    )

    // 4. comment on PR with coverage diff
    // 5. commit new coverage summary

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
