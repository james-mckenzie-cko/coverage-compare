import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    // get branch coverage

    const myToken = core.getInput('myToken')

    const octokit = new github.GitHub(myToken)

    console.log(process.env.GITHUB_REF)

    // get base coverage
    // compare coverage
    // comment coverage diff
    // commit new coverage

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
