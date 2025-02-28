import childProcess from 'child_process'

export const getCommitHash = (() => {
  const subst = "$Format:%h$"
  if(!subst.match(/Format:/)) {
    return subst
  } else {
    try {
      return childProcess
        .execSync('git rev-parse --short HEAD')
        .toString()
        .trim()
    } catch (e) {
      console.error('Failed run git:', e)
      return 'UNKNOWN'
    }
  }
})
