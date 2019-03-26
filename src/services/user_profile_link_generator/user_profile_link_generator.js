import { includes } from 'lodash'

const generateProfileLink = (id, screenName, restrictedNicknames) => {
  const complicated = (isExternal(screenName) || includes(restrictedNicknames, screenName))
  return {
    name: (!screenName || complicated ? 'external-user-profile' : 'user-profile'),
    params: (!screenName || complicated ? { id } : { name: screenName })
  }
}

const isExternal = screenName => screenName && screenName.includes('@')

export default generateProfileLink
