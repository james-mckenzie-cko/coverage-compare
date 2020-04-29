import * as core from '@actions/core'
import * as github from '@actions/github'
import {exec} from 'child_process'
import {getSummary} from './getCoverage'

async function run(): Promise<void> {
  try {
    // get branch coverage

    const currentBranchName = await exec(`git rev-parse --abbrev-ref HEAD`)

    await exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`)

    const baseCoverage = require('./coverage-compare/coverage-summary.json')

    await exec(`git checkout -f ${currentBranchName}`)

    const branchCoverage = require('./coverage-compare/coverage-summary.json')

    console.log('base', getSummary(baseCoverage))
    console.log('base', getSummary(branchCoverage))

    // compare coverage
    // comment coverage diff
    // commit new coverage

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
