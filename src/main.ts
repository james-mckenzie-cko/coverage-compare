import * as core from '@actions/core'
import {promisify} from 'util'
import childProcess from 'child_process'
import {getSummary} from './getCoverage'

const exec = promisify(childProcess.exec)

const getCoverageFile = (branch: string) => {
  let coverage
  try {
    coverage = require('./coverage-compare/coverage-summary.json')
  } catch {
    console.log(`no coverage found for branch ` + branch)
  }

  return coverage
}

const getCurrentBranch = async () =>
  (await exec(`git rev-parse --abbrev-ref HEAD`)).stdout

async function run(): Promise<void> {
  try {
    const currentBranchName = await getCurrentBranch()

    const baseBranchName = await getCurrentBranch()

    console.log('currentBranchName, ', currentBranchName)
    console.log('baseBranchName', baseBranchName)
    console.log('GITHUB_BASE_REF', process.env.GITHUB_BASE_REF)

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
