export const muteFilterHits = (muteFilters, status) => {
  const statusText = status.text.toLowerCase()
  const statusSummary = status.summary.toLowerCase()

  return muteFilters.toSorted((a,b) => b.order - a.order).map(filter => {
    const { hide, expires, name, value, type, enabled} = filter
    if (!enabled) return false
    if (expires !== null && expires < Date.now()) return false
    switch (type) {
      case 'word': {
        if (statusText.includes(value) || statusSummary.includes(value)) {
          return { hide, name }
        }
        break
      }
      case 'regexp': {
        try {
          const re = new RegExp(value, 'i')
          if (re.test(statusText) || re.test(statusSummary)) {
            return { hide, name }
          }
          return false
        } catch {
          return false
        }
      }
    }
  }).filter(_ => _)
}
