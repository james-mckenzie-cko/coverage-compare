const getCoverageFile = () => {
  let coverage
  try {
    coverage = require('./coverage-compare/coverage-summary.json')
  } catch {
    console.log(`no coverage found`)
  }
  return coverage
}

function getSummary(coverage) {
  return Object.keys(coverage.total).reduce((acc, curr, i) => {
    return {
      ...acc,
      [curr]: coverage.total[curr].pct
    }
  }, {})
}

const currentBranchName = await exec(`git rev-parse --abbrev-ref HEAD`)

await exec(`git checkout -f ${process.env.GITHUB_BASE_REF}`)

const baseCoverage = getCoverageFile()

await exec(`git checkout -f ${currentBranchName}`)

const branchCoverage = getCoverageFile()

const baseSummary = baseCoverage && getSummary(baseCoverage)
const branchSummary = branchCoverage && getSummary(branchCoverage)

console.log('base', baseSummary)
console.log('base', branchSummary)
