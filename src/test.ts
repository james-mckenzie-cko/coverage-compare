import {generateTable} from './main'
import fs from 'fs'

const getCoverageFile = (filename: string) => {
  try {
    return JSON.parse(
      fs.readFileSync(`./coverage-compare/${filename}.json`, 'utf8')
    )
  } catch (e) {
    console.log('no coverage file found on base branch')
    return undefined
  }
}
;(() => {
  const base = getCoverageFile('coverage-summary')
  const compare = getCoverageFile('tmp')
  console.log(generateTable(base.total, compare.total))
})()
