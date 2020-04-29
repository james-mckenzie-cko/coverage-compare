export const getSummary = (coverage: {total: {[k: string]: any}}) =>
  Object.keys(coverage.total).reduce((acc, curr, i) => {
    return {
      ...acc,
      [curr]: coverage.total[curr].pct
    }
  }, {})
