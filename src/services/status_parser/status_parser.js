import { useServerSideStorageStore } from 'src/stores/serverSideStorage'

export const muteFilterHits = (status) => {
  const statusText = status.text.toLowerCase()
  const statusSummary = status.summary.toLowerCase()

  const muteFilters = Object.values(useServerSideStorageStore().prefsStorage.simple.muteFilters)

  return muteFilters.toSorted((a,b) => b.order - a.order).map(filter => {
    const { hide, expires, name, value, type} = filter
    if (expires !== null && expires < Date.now()) return false
    switch (type) {
      case 'word': {
        if (statusText.includes(value) || statusSummary.includes(value)) {
          return { hide, name }
        }
      }
      case 'regexp': {
        try {
          const re = new RegExp(value, 'i')
          if (re.test(statusText) || re.test(statusSummary)) {
            return { hide, name }
          }
        } catch {
          return false
        }
      }
    }
  }).filter(_ => _)
}
