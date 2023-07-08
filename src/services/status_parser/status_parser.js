import { filter } from 'lodash'

export const muteWordHits = (status, muteWords) => {
  const statusText = status.text.toLowerCase()
  const statusSummary = status.summary.toLowerCase()
  const hits = filter(muteWords, (muteWord) => {
    return statusText.includes(muteWord.toLowerCase()) || statusSummary.includes(muteWord.toLowerCase())
  })

  return hits
}

export const muteRegexHits = (status, muteRegexes) => {
  const statusText = status.text
  const statusSummary = status.summary
  const hits = filter(muteRegexes, (muteRegex) => {
    try {
      const muteRegexPattern = new RegExp(muteRegex)
      return statusText.match(muteRegexPattern) || statusSummary.match(muteRegexPattern)
    } catch (exception) {
      console.log('Exception: ' + exception)
      return false
    }
  })

  return hits
}
