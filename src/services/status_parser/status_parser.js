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
    return statusText.match(new RegExp(muteRegex)) || statusSummary.match(new RegExp(muteRegex))
  })

  return hits
}
