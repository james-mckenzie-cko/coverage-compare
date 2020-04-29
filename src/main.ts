import * as core from '@actions/core'
import * as github from '@actions/github'
import {exec} from 'child_process'
import {getSummary} from './getCoverage'

const getCoverageFile = () => {
  let coverage
  try {
    coverage = require('./coverage-compare/coverage-summary.json')
  } catch {
    console.log(`no coverage found`)
  }
  return coverage
}

async function run(): Promise<void> {
  try {
    // get branch coverage

    const currentBranchName = await exec(`git rev-parse --abbrev-ref HEAD`)

    await exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`)

    const baseCoverage = getCoverageFile()

    await exec(`git checkout -f ${currentBranchName}`)

    const branchCoverage = getCoverageFile()

    const baseSummary = baseCoverage && getSummary(baseCoverage)
    const branchSummary = branchCoverage && getSummary(branchCoverage)

    console.log('base', baseSummary)
    console.log('base', branchSummary)

    // compare coverage
    // comment coverage diff
    // commit new coverage

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
