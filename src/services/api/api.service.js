import { each, map, concat, last, get } from 'lodash'
import { parseStatus, parseSource, parseUser, parseNotification, parseAttachment, parseChat, parseLinkHeaderPagination } from '../entity_normalizer/entity_normalizer.service.js'
import { RegistrationError, StatusCodeError } from '../errors/errors'

/* eslint-env browser */
const MUTES_IMPORT_URL = '/api/pleroma/mutes_import'
const BLOCKS_IMPORT_URL = '/api/pleroma/blocks_import'
const FOLLOW_IMPORT_URL = '/api/pleroma/follow_import'
const DELETE_ACCOUNT_URL = '/api/pleroma/delete_account'
const CHANGE_EMAIL_URL = '/api/pleroma/change_email'
const CHANGE_PASSWORD_URL = '/api/pleroma/change_password'
const MOVE_ACCOUNT_URL = '/api/pleroma/move_account'
const ALIASES_URL = '/api/pleroma/aliases'
const TAG_USER_URL = '/api/pleroma/admin/users/tag'
const PERMISSION_GROUP_URL = (screenName, right) => `/api/pleroma/admin/users/${screenName}/permission_group/${right}`
const ACTIVATE_USER_URL = '/api/pleroma/admin/users/activate'
const DEACTIVATE_USER_URL = '/api/pleroma/admin/users/deactivate'
const ADMIN_USERS_URL = '/api/pleroma/admin/users'
const SUGGESTIONS_URL = '/api/v1/suggestions'
const NOTIFICATION_SETTINGS_URL = '/api/pleroma/notification_settings'
const NOTIFICATION_READ_URL = '/api/v1/pleroma/notifications/read'

const MFA_SETTINGS_URL = '/api/pleroma/accounts/mfa'
const MFA_BACKUP_CODES_URL = '/api/pleroma/accounts/mfa/backup_codes'

const MFA_SETUP_OTP_URL = '/api/pleroma/accounts/mfa/setup/totp'
const MFA_CONFIRM_OTP_URL = '/api/pleroma/accounts/mfa/confirm/totp'
const MFA_DISABLE_OTP_URL = '/api/pleroma/accounts/mfa/totp'

const MASTODON_LOGIN_URL = '/api/v1/accounts/verify_credentials'
const MASTODON_REGISTRATION_URL = '/api/v1/accounts'
const MASTODON_USER_FAVORITES_TIMELINE_URL = '/api/v1/favourites'
const MASTODON_USER_NOTIFICATIONS_URL = '/api/v1/notifications'
const MASTODON_DISMISS_NOTIFICATION_URL = id => `/api/v1/notifications/${id}/dismiss`
const MASTODON_FAVORITE_URL = id => `/api/v1/statuses/${id}/favourite`
const MASTODON_UNFAVORITE_URL = id => `/api/v1/statuses/${id}/unfavourite`
const MASTODON_RETWEET_URL = id => `/api/v1/statuses/${id}/reblog`
const MASTODON_UNRETWEET_URL = id => `/api/v1/statuses/${id}/unreblog`
const MASTODON_DELETE_URL = id => `/api/v1/statuses/${id}`
const MASTODON_FOLLOW_URL = id => `/api/v1/accounts/${id}/follow`
const MASTODON_UNFOLLOW_URL = id => `/api/v1/accounts/${id}/unfollow`
const MASTODON_FOLLOWING_URL = id => `/api/v1/accounts/${id}/following`
const MASTODON_FOLLOWERS_URL = id => `/api/v1/accounts/${id}/followers`
const MASTODON_FOLLOW_REQUESTS_URL = '/api/v1/follow_requests'
const MASTODON_APPROVE_USER_URL = id => `/api/v1/follow_requests/${id}/authorize`
const MASTODON_DENY_USER_URL = id => `/api/v1/follow_requests/${id}/reject`
const MASTODON_DIRECT_MESSAGES_TIMELINE_URL = '/api/v1/timelines/direct'
const MASTODON_PUBLIC_TIMELINE = '/api/v1/timelines/public'
const MASTODON_USER_HOME_TIMELINE_URL = '/api/v1/timelines/home'
const MASTODON_STATUS_URL = id => `/api/v1/statuses/${id}`
const MASTODON_STATUS_CONTEXT_URL = id => `/api/v1/statuses/${id}/context`
const MASTODON_STATUS_SOURCE_URL = id => `/api/v1/statuses/${id}/source`
const MASTODON_STATUS_HISTORY_URL = id => `/api/v1/statuses/${id}/history`
const MASTODON_USER_URL = '/api/v1/accounts'
const MASTODON_USER_LOOKUP_URL = '/api/v1/accounts/lookup'
const MASTODON_USER_RELATIONSHIPS_URL = '/api/v1/accounts/relationships'
const MASTODON_USER_TIMELINE_URL = id => `/api/v1/accounts/${id}/statuses`
const MASTODON_USER_IN_LISTS = id => `/api/v1/accounts/${id}/lists`
const MASTODON_LIST_URL = id => `/api/v1/lists/${id}`
const MASTODON_LIST_TIMELINE_URL = id => `/api/v1/timelines/list/${id}`
const MASTODON_LIST_ACCOUNTS_URL = id => `/api/v1/lists/${id}/accounts`
const MASTODON_TAG_TIMELINE_URL = tag => `/api/v1/timelines/tag/${tag}`
const MASTODON_BOOKMARK_TIMELINE_URL = '/api/v1/bookmarks'
const MASTODON_USER_BLOCKS_URL = '/api/v1/blocks/'
const MASTODON_USER_MUTES_URL = '/api/v1/mutes/'
const MASTODON_BLOCK_USER_URL = id => `/api/v1/accounts/${id}/block`
const MASTODON_UNBLOCK_USER_URL = id => `/api/v1/accounts/${id}/unblock`
const MASTODON_MUTE_USER_URL = id => `/api/v1/accounts/${id}/mute`
const MASTODON_UNMUTE_USER_URL = id => `/api/v1/accounts/${id}/unmute`
const MASTODON_REMOVE_USER_FROM_FOLLOWERS = id => `/api/v1/accounts/${id}/remove_from_followers`
const MASTODON_USER_NOTE_URL = id => `/api/v1/accounts/${id}/note`
const MASTODON_BOOKMARK_STATUS_URL = id => `/api/v1/statuses/${id}/bookmark`
const MASTODON_UNBOOKMARK_STATUS_URL = id => `/api/v1/statuses/${id}/unbookmark`
const MASTODON_POST_STATUS_URL = '/api/v1/statuses'
const MASTODON_MEDIA_UPLOAD_URL = '/api/v1/media'
const MASTODON_VOTE_URL = id => `/api/v1/polls/${id}/votes`
const MASTODON_POLL_URL = id => `/api/v1/polls/${id}`
const MASTODON_STATUS_FAVORITEDBY_URL = id => `/api/v1/statuses/${id}/favourited_by`
const MASTODON_STATUS_REBLOGGEDBY_URL = id => `/api/v1/statuses/${id}/reblogged_by`
const MASTODON_PROFILE_UPDATE_URL = '/api/v1/accounts/update_credentials'
const MASTODON_REPORT_USER_URL = '/api/v1/reports'
const MASTODON_PIN_OWN_STATUS = id => `/api/v1/statuses/${id}/pin`
const MASTODON_UNPIN_OWN_STATUS = id => `/api/v1/statuses/${id}/unpin`
const MASTODON_MUTE_CONVERSATION = id => `/api/v1/statuses/${id}/mute`
const MASTODON_UNMUTE_CONVERSATION = id => `/api/v1/statuses/${id}/unmute`
const MASTODON_SEARCH_2 = '/api/v2/search'
const MASTODON_USER_SEARCH_URL = '/api/v1/accounts/search'
const MASTODON_DOMAIN_BLOCKS_URL = '/api/v1/domain_blocks'
const MASTODON_LISTS_URL = '/api/v1/lists'
const MASTODON_STREAMING = '/api/v1/streaming'
const MASTODON_KNOWN_DOMAIN_LIST_URL = '/api/v1/instance/peers'
const MASTODON_ANNOUNCEMENTS_URL = '/api/v1/announcements'
const MASTODON_ANNOUNCEMENTS_DISMISS_URL = id => `/api/v1/announcements/${id}/dismiss`
const PLEROMA_EMOJI_REACTIONS_URL = id => `/api/v1/pleroma/statuses/${id}/reactions`
const PLEROMA_EMOJI_REACT_URL = (id, emoji) => `/api/v1/pleroma/statuses/${id}/reactions/${emoji}`
const PLEROMA_EMOJI_UNREACT_URL = (id, emoji) => `/api/v1/pleroma/statuses/${id}/reactions/${emoji}`
const PLEROMA_CHATS_URL = '/api/v1/pleroma/chats'
const PLEROMA_CHAT_URL = id => `/api/v1/pleroma/chats/by-account-id/${id}`
const PLEROMA_CHAT_MESSAGES_URL = id => `/api/v1/pleroma/chats/${id}/messages`
const PLEROMA_CHAT_READ_URL = id => `/api/v1/pleroma/chats/${id}/read`
const PLEROMA_DELETE_CHAT_MESSAGE_URL = (chatId, messageId) => `/api/v1/pleroma/chats/${chatId}/messages/${messageId}`
const PLEROMA_ADMIN_REPORTS = '/api/pleroma/admin/reports'
const PLEROMA_BACKUP_URL = '/api/v1/pleroma/backups'
const PLEROMA_ANNOUNCEMENTS_URL = '/api/v1/pleroma/admin/announcements'
const PLEROMA_POST_ANNOUNCEMENT_URL = '/api/v1/pleroma/admin/announcements'
const PLEROMA_EDIT_ANNOUNCEMENT_URL = id => `/api/v1/pleroma/admin/announcements/${id}`
const PLEROMA_DELETE_ANNOUNCEMENT_URL = id => `/api/v1/pleroma/admin/announcements/${id}`
const PLEROMA_SCROBBLES_URL = id => `/api/v1/pleroma/accounts/${id}/scrobbles`
const PLEROMA_STATUS_QUOTES_URL = id => `/api/v1/pleroma/statuses/${id}/quotes`
const PLEROMA_USER_FAVORITES_TIMELINE_URL = id => `/api/v1/pleroma/accounts/${id}/favourites`
const PLEROMA_BOOKMARK_FOLDERS_URL = '/api/v1/pleroma/bookmark_folders'
const PLEROMA_BOOKMARK_FOLDER_URL = id => `/api/v1/pleroma/bookmark_folders/${id}`

const PLEROMA_ADMIN_CONFIG_URL = '/api/pleroma/admin/config'
const PLEROMA_ADMIN_DESCRIPTIONS_URL = '/api/pleroma/admin/config/descriptions'
const PLEROMA_ADMIN_FRONTENDS_URL = '/api/pleroma/admin/frontends'
const PLEROMA_ADMIN_FRONTENDS_INSTALL_URL = '/api/pleroma/admin/frontends/install'

const PLEROMA_EMOJI_RELOAD_URL = '/api/pleroma/admin/reload_emoji'
const PLEROMA_EMOJI_IMPORT_FS_URL = '/api/pleroma/emoji/packs/import'
const PLEROMA_EMOJI_PACKS_URL = (page, pageSize) => `/api/v1/pleroma/emoji/packs?page=${page}&page_size=${pageSize}`
const PLEROMA_EMOJI_PACK_URL = (name) => `/api/v1/pleroma/emoji/pack?name=${name}`
const PLEROMA_EMOJI_PACKS_DL_REMOTE_URL = '/api/v1/pleroma/emoji/packs/download'
const PLEROMA_EMOJI_PACKS_LS_REMOTE_URL =
  (url, page, pageSize) => `/api/v1/pleroma/emoji/packs/remote?url=${url}&page=${page}&page_size=${pageSize}`
const PLEROMA_EMOJI_UPDATE_FILE_URL = (name) => `/api/v1/pleroma/emoji/packs/files?name=${name}`

const oldfetch = window.fetch

const fetch = (url, options) => {
  options = options || {}
  const baseUrl = ''
  const fullUrl = baseUrl + url
  options.credentials = 'same-origin'
  return oldfetch(fullUrl, options)
}

const promisedRequest = ({ method, url, params, payload, credentials, headers = {} }) => {
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers
    }
  }
  if (params) {
    url += '?' + Object.entries(params)
      .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
      .join('&')
  }
  if (payload) {
    options.body = JSON.stringify(payload)
  }
  if (credentials) {
    options.headers = {
      ...options.headers,
      ...authHeaders(credentials)
    }
  }
  return fetch(url, options)
    .then((response) => {
      return new Promise((resolve, reject) => response.json()
        .then((json) => {
          if (!response.ok) {
            return reject(new StatusCodeError(response.status, json, { url, options }, response))
          }
          return resolve(json)
        })
        .catch((error) => {
          return reject(new StatusCodeError(response.status, error, { url, options }, response))
        })
      )
    })
}

const updateNotificationSettings = ({ credentials, settings }) => {
  const form = new FormData()

  each(settings, (value, key) => {
    form.append(key, value)
  })

  return fetch(`${NOTIFICATION_SETTINGS_URL}?${new URLSearchParams(settings)}`, {
    headers: authHeaders(credentials),
    method: 'PUT',
    body: form
  }).then((data) => data.json())
}

const updateProfileImages = ({ credentials, avatar = null, avatarName = null, banner = null, background = null }) => {
  const form = new FormData()
  if (avatar !== null) {
    if (avatarName !== null) {
      form.append('avatar', avatar, avatarName)
    } else {
      form.append('avatar', avatar)
    }
  }
  if (banner !== null) form.append('header', banner)
  if (background !== null) form.append('pleroma_background_image', background)
  return fetch(MASTODON_PROFILE_UPDATE_URL, {
    headers: authHeaders(credentials),
    method: 'PATCH',
    body: form
  })
    .then((data) => data.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error)
      }
      return parseUser(data)
    })
}

const updateProfile = ({ credentials, params }) => {
  return promisedRequest({
    url: MASTODON_PROFILE_UPDATE_URL,
    method: 'PATCH',
    payload: params,
    credentials
  }).then((data) => parseUser(data))
}

// Params needed:
// nickname
// email
// fullname
// password
// password_confirm
//
// Optional
// bio
// homepage
// location
// token
// language
const register = ({ params, credentials }) => {
  const { nickname, ...rest } = params
  return fetch(MASTODON_REGISTRATION_URL, {
    method: 'POST',
    headers: {
      ...authHeaders(credentials),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nickname,
      locale: 'en_US',
      agreement: true,
      ...rest
    })
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return response.json().then((error) => { throw new RegistrationError(error) })
      }
    })
}

const getCaptcha = () => fetch('/api/pleroma/captcha').then(resp => resp.json())

const authHeaders = (accessToken) => {
  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` }
  } else {
    return { }
  }
}

const followUser = ({ id, credentials, ...options }) => {
  const url = MASTODON_FOLLOW_URL(id)
  const form = {}
  if (options.reblogs !== undefined) { form.reblogs = options.reblogs }
  if (options.notify !== undefined) { form.notify = options.notify }
  return fetch(url, {
    body: JSON.stringify(form),
    headers: {
      ...authHeaders(credentials),
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then((data) => data.json())
}

const unfollowUser = ({ id, credentials }) => {
  const url = MASTODON_UNFOLLOW_URL(id)
  return fetch(url, {
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const fetchUserInLists = ({ id, credentials }) => {
  const url = MASTODON_USER_IN_LISTS(id)
  return fetch(url, {
    headers: authHeaders(credentials)
  }).then((data) => data.json())
}

const pinOwnStatus = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_PIN_OWN_STATUS(id), credentials, method: 'POST' })
    .then((data) => parseStatus(data))
}

const unpinOwnStatus = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_UNPIN_OWN_STATUS(id), credentials, method: 'POST' })
    .then((data) => parseStatus(data))
}

const muteConversation = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_MUTE_CONVERSATION(id), credentials, method: 'POST' })
    .then((data) => parseStatus(data))
}

const unmuteConversation = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_UNMUTE_CONVERSATION(id), credentials, method: 'POST' })
    .then((data) => parseStatus(data))
}

const blockUser = ({ id, credentials }) => {
  return fetch(MASTODON_BLOCK_USER_URL(id), {
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const unblockUser = ({ id, credentials }) => {
  return fetch(MASTODON_UNBLOCK_USER_URL(id), {
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const removeUserFromFollowers = ({ id, credentials }) => {
  return fetch(MASTODON_REMOVE_USER_FROM_FOLLOWERS(id), {
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const editUserNote = ({ id, credentials, comment }) => {
  return promisedRequest({
    url: MASTODON_USER_NOTE_URL(id),
    credentials,
    payload: {
      comment
    },
    method: 'POST'
  })
}

const approveUser = ({ id, credentials }) => {
  const url = MASTODON_APPROVE_USER_URL(id)
  return fetch(url, {
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const denyUser = ({ id, credentials }) => {
  const url = MASTODON_DENY_USER_URL(id)
  return fetch(url, {
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const fetchUser = ({ id, credentials }) => {
  const url = `${MASTODON_USER_URL}/${id}`
  return promisedRequest({ url, credentials })
    .then((data) => parseUser(data))
}

const fetchUserByName = ({ name, credentials }) => {
  return promisedRequest({
    url: MASTODON_USER_LOOKUP_URL,
    credentials,
    params: { acct: name }
  })
    .then(data => data.id)
    .catch(error => {
      if (error && error.statusCode === 404) {
        // Either the backend does not support lookup endpoint,
        // or there is no user with such name. Fallback and treat name as id.
        return name
      } else {
        throw error
      }
    })
    .then(id => fetchUser({ id, credentials }))
}

const fetchUserRelationship = ({ id, credentials }) => {
  const url = `${MASTODON_USER_RELATIONSHIPS_URL}/?id=${id}`
  return fetch(url, { headers: authHeaders(credentials) })
    .then((response) => {
      return new Promise((resolve, reject) => response.json()
        .then((json) => {
          if (!response.ok) {
            return reject(new StatusCodeError(response.status, json, { url }, response))
          }
          return resolve(json)
        }))
    })
}

const fetchFriends = ({ id, maxId, sinceId, limit = 20, credentials }) => {
  let url = MASTODON_FOLLOWING_URL(id)
  const args = [
    maxId && `max_id=${maxId}`,
    sinceId && `since_id=${sinceId}`,
    limit && `limit=${limit}`,
    'with_relationships=true'
  ].filter(_ => _).join('&')

  url = url + (args ? '?' + args : '')
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
    .then((data) => data.map(parseUser))
}

const exportFriends = ({ id, credentials }) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      let friends = []
      let more = true
      while (more) {
        const maxId = friends.length > 0 ? last(friends).id : undefined
        const users = await fetchFriends({ id, maxId, credentials })
        friends = concat(friends, users)
        if (users.length === 0) {
          more = false
        }
      }
      resolve(friends)
    } catch (err) {
      reject(err)
    }
  })
}

const fetchFollowers = ({ id, maxId, sinceId, limit = 20, credentials }) => {
  let url = MASTODON_FOLLOWERS_URL(id)
  const args = [
    maxId && `max_id=${maxId}`,
    sinceId && `since_id=${sinceId}`,
    limit && `limit=${limit}`,
    'with_relationships=true'
  ].filter(_ => _).join('&')

  url += args ? '?' + args : ''
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
    .then((data) => data.map(parseUser))
}

const fetchFollowRequests = ({ credentials }) => {
  const url = MASTODON_FOLLOW_REQUESTS_URL
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
    .then((data) => data.map(parseUser))
}

const fetchLists = ({ credentials }) => {
  const url = MASTODON_LISTS_URL
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
}

const createList = ({ title, credentials }) => {
  const url = MASTODON_LISTS_URL
  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(url, {
    headers,
    method: 'POST',
    body: JSON.stringify({ title })
  }).then((data) => data.json())
}

const getList = ({ listId, credentials }) => {
  const url = MASTODON_LIST_URL(listId)
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
}

const updateList = ({ listId, title, credentials }) => {
  const url = MASTODON_LIST_URL(listId)
  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(url, {
    headers,
    method: 'PUT',
    body: JSON.stringify({ title })
  })
}

const getListAccounts = ({ listId, credentials }) => {
  const url = MASTODON_LIST_ACCOUNTS_URL(listId)
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
    .then((data) => data.map(({ id }) => id))
}

const addAccountsToList = ({ listId, accountIds, credentials }) => {
  const url = MASTODON_LIST_ACCOUNTS_URL(listId)
  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(url, {
    headers,
    method: 'POST',
    body: JSON.stringify({ account_ids: accountIds })
  })
}

const removeAccountsFromList = ({ listId, accountIds, credentials }) => {
  const url = MASTODON_LIST_ACCOUNTS_URL(listId)
  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(url, {
    headers,
    method: 'DELETE',
    body: JSON.stringify({ account_ids: accountIds })
  })
}

const deleteList = ({ listId, credentials }) => {
  const url = MASTODON_LIST_URL(listId)
  return fetch(url, {
    method: 'DELETE',
    headers: authHeaders(credentials)
  })
}

const fetchConversation = ({ id, credentials }) => {
  const urlContext = MASTODON_STATUS_CONTEXT_URL(id)
  return fetch(urlContext, { headers: authHeaders(credentials) })
    .then((data) => {
      if (data.ok) {
        return data
      }
      throw new Error('Error fetching timeline', data)
    })
    .then((data) => data.json())
    .then(({ ancestors, descendants }) => ({
      ancestors: ancestors.map(parseStatus),
      descendants: descendants.map(parseStatus)
    }))
}

const fetchStatus = ({ id, credentials }) => {
  const url = MASTODON_STATUS_URL(id)
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => {
      if (data.ok) {
        return data
      }
      throw new Error('Error fetching timeline', data)
    })
    .then((data) => data.json())
    .then((data) => parseStatus(data))
}

const fetchStatusSource = ({ id, credentials }) => {
  const url = MASTODON_STATUS_SOURCE_URL(id)
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => {
      if (data.ok) {
        return data
      }
      throw new Error('Error fetching source', data)
    })
    .then((data) => data.json())
    .then((data) => parseSource(data))
}

const fetchStatusHistory = ({ status, credentials }) => {
  const url = MASTODON_STATUS_HISTORY_URL(status.id)
  return promisedRequest({ url, credentials })
    .then((data) => {
      data.reverse()
      return data.map((item) => {
        item.originalStatus = status
        return parseStatus(item)
      })
    })
}

const tagUser = ({ tag, credentials, user }) => {
  const screenName = user.screen_name
  const form = {
    nicknames: [screenName],
    tags: [tag]
  }

  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(TAG_USER_URL, {
    method: 'PUT',
    headers,
    body: JSON.stringify(form)
  })
}

const untagUser = ({ tag, credentials, user }) => {
  const screenName = user.screen_name
  const body = {
    nicknames: [screenName],
    tags: [tag]
  }

  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(TAG_USER_URL, {
    method: 'DELETE',
    headers,
    body: JSON.stringify(body)
  })
}

const addRight = ({ right, credentials, user }) => {
  const screenName = user.screen_name

  return fetch(PERMISSION_GROUP_URL(screenName, right), {
    method: 'POST',
    headers: authHeaders(credentials),
    body: {}
  })
}

const deleteRight = ({ right, credentials, user }) => {
  const screenName = user.screen_name

  return fetch(PERMISSION_GROUP_URL(screenName, right), {
    method: 'DELETE',
    headers: authHeaders(credentials),
    body: {}
  })
}

const activateUser = ({ credentials, user: { screen_name: nickname } }) => {
  return promisedRequest({
    url: ACTIVATE_USER_URL,
    method: 'PATCH',
    credentials,
    payload: {
      nicknames: [nickname]
    }
  }).then(response => get(response, 'users.0'))
}

const deactivateUser = ({ credentials, user: { screen_name: nickname } }) => {
  return promisedRequest({
    url: DEACTIVATE_USER_URL,
    method: 'PATCH',
    credentials,
    payload: {
      nicknames: [nickname]
    }
  }).then(response => get(response, 'users.0'))
}

const deleteUser = ({ credentials, user }) => {
  const screenName = user.screen_name
  const headers = authHeaders(credentials)

  return fetch(`${ADMIN_USERS_URL}?nickname=${screenName}`, {
    method: 'DELETE',
    headers
  })
}

const fetchTimeline = ({
  timeline,
  credentials,
  since = false,
  minId = false,
  until = false,
  userId = false,
  listId = false,
  statusId = false,
  tag = false,
  withMuted = false,
  replyVisibility = 'all',
  includeTypes = [],
  bookmarkFolderId = false
}) => {
  const timelineUrls = {
    public: MASTODON_PUBLIC_TIMELINE,
    friends: MASTODON_USER_HOME_TIMELINE_URL,
    dms: MASTODON_DIRECT_MESSAGES_TIMELINE_URL,
    notifications: MASTODON_USER_NOTIFICATIONS_URL,
    publicAndExternal: MASTODON_PUBLIC_TIMELINE,
    user: MASTODON_USER_TIMELINE_URL,
    media: MASTODON_USER_TIMELINE_URL,
    list: MASTODON_LIST_TIMELINE_URL,
    favorites: MASTODON_USER_FAVORITES_TIMELINE_URL,
    publicFavorites: PLEROMA_USER_FAVORITES_TIMELINE_URL,
    tag: MASTODON_TAG_TIMELINE_URL,
    bookmarks: MASTODON_BOOKMARK_TIMELINE_URL,
    quotes: PLEROMA_STATUS_QUOTES_URL
  }
  const isNotifications = timeline === 'notifications'
  const params = []

  let url = timelineUrls[timeline]

  if (timeline === 'favorites' && userId) {
    url = timelineUrls.publicFavorites(userId)
  }

  if (timeline === 'user' || timeline === 'media') {
    url = url(userId)
  }

  if (timeline === 'list') {
    url = url(listId)
  }

  if (timeline === 'quotes') {
    url = url(statusId)
  }

  if (minId) {
    params.push(['min_id', minId])
  }
  if (since) {
    params.push(['since_id', since])
  }
  if (until) {
    params.push(['max_id', until])
  }
  if (tag) {
    url = url(tag)
  }
  if (timeline === 'media') {
    params.push(['only_media', 1])
  }
  if (timeline === 'public') {
    params.push(['local', true])
  }
  if (timeline === 'public' || timeline === 'publicAndExternal') {
    params.push(['only_media', false])
  }
  if (timeline !== 'favorites' && timeline !== 'bookmarks') {
    params.push(['with_muted', withMuted])
  }
  if (replyVisibility !== 'all') {
    params.push(['reply_visibility', replyVisibility])
  }
  if (includeTypes.length > 0) {
    includeTypes.forEach(type => {
      params.push(['include_types[]', type])
    })
  }
  if (timeline === 'bookmarks' && bookmarkFolderId) {
    params.push(['folder_id', bookmarkFolderId])
  }

  params.push(['limit', 20])

  const queryString = map(params, (param) => `${param[0]}=${param[1]}`).join('&')
  url += `?${queryString}`

  return fetch(url, { headers: authHeaders(credentials) })
    .then(async (response) => {
      const success = response.ok

      const data = await response.json()

      if (success && !data.errors) {
        const pagination = parseLinkHeaderPagination(response.headers.get('Link'), {
          flakeId: timeline !== 'bookmarks' && timeline !== 'notifications'
        })

        return { data: data.map(isNotifications ? parseNotification : parseStatus), pagination }
      } else {
        data.errors ||= []
        data.status = response.status
        data.statusText = response.statusText
        return data
      }
    })
}

const fetchPinnedStatuses = ({ id, credentials }) => {
  const url = MASTODON_USER_TIMELINE_URL(id) + '?pinned=true'
  return promisedRequest({ url, credentials })
    .then((data) => data.map(parseStatus))
}

const verifyCredentials = (user) => {
  return fetch(MASTODON_LOGIN_URL, {
    headers: authHeaders(user)
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
    .then((data) => data.error ? data : parseUser(data))
}

const favorite = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_FAVORITE_URL(id), method: 'POST', credentials })
    .then((data) => parseStatus(data))
}

const unfavorite = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_UNFAVORITE_URL(id), method: 'POST', credentials })
    .then((data) => parseStatus(data))
}

const retweet = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_RETWEET_URL(id), method: 'POST', credentials })
    .then((data) => parseStatus(data))
}

const unretweet = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_UNRETWEET_URL(id), method: 'POST', credentials })
    .then((data) => parseStatus(data))
}

const bookmarkStatus = ({ id, credentials, ...options }) => {
  return promisedRequest({
    url: MASTODON_BOOKMARK_STATUS_URL(id),
    headers: authHeaders(credentials),
    method: 'POST',
    payload: {
      folder_id: options.folder_id
    }
  })
}

const unbookmarkStatus = ({ id, credentials }) => {
  return promisedRequest({
    url: MASTODON_UNBOOKMARK_STATUS_URL(id),
    headers: authHeaders(credentials),
    method: 'POST'
  })
}

const postStatus = ({
  credentials,
  status,
  spoilerText,
  visibility,
  sensitive,
  poll,
  mediaIds = [],
  inReplyToStatusId,
  quoteId,
  contentType,
  preview,
  idempotencyKey
}) => {
  const form = new FormData()
  const pollOptions = poll.options || []

  form.append('status', status)
  form.append('source', 'Pleroma FE')
  if (spoilerText) form.append('spoiler_text', spoilerText)
  if (visibility) form.append('visibility', visibility)
  if (sensitive) form.append('sensitive', sensitive)
  if (contentType) form.append('content_type', contentType)
  mediaIds.forEach(val => {
    form.append('media_ids[]', val)
  })
  if (pollOptions.some(option => option !== '')) {
    const normalizedPoll = {
      expires_in: parseInt(poll.expiresIn, 10),
      multiple: poll.multiple
    }
    Object.keys(normalizedPoll).forEach(key => {
      form.append(`poll[${key}]`, normalizedPoll[key])
    })

    pollOptions.forEach(option => {
      form.append('poll[options][]', option)
    })
  }
  if (inReplyToStatusId) {
    form.append('in_reply_to_id', inReplyToStatusId)
  }
  if (quoteId) {
    form.append('quote_id', quoteId)
  }
  if (preview) {
    form.append('preview', 'true')
  }

  const postHeaders = authHeaders(credentials)
  if (idempotencyKey) {
    postHeaders['idempotency-key'] = idempotencyKey
  }

  return fetch(MASTODON_POST_STATUS_URL, {
    body: form,
    method: 'POST',
    headers: postHeaders
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => data.error ? data : parseStatus(data))
}

const editStatus = ({
  id,
  credentials,
  status,
  spoilerText,
  sensitive,
  poll,
  mediaIds = [],
  contentType
}) => {
  const form = new FormData()
  const pollOptions = poll.options || []

  form.append('status', status)
  if (spoilerText) form.append('spoiler_text', spoilerText)
  if (sensitive) form.append('sensitive', sensitive)
  if (contentType) form.append('content_type', contentType)
  mediaIds.forEach(val => {
    form.append('media_ids[]', val)
  })

  if (pollOptions.some(option => option !== '')) {
    const normalizedPoll = {
      expires_in: parseInt(poll.expiresIn, 10),
      multiple: poll.multiple
    }
    Object.keys(normalizedPoll).forEach(key => {
      form.append(`poll[${key}]`, normalizedPoll[key])
    })

    pollOptions.forEach(option => {
      form.append('poll[options][]', option)
    })
  }

  const putHeaders = authHeaders(credentials)

  return fetch(MASTODON_STATUS_URL(id), {
    body: form,
    method: 'PUT',
    headers: putHeaders
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => data.error ? data : parseStatus(data))
}

const deleteStatus = ({ id, credentials }) => {
  return promisedRequest({
    url: MASTODON_DELETE_URL(id),
    credentials,
    method: 'DELETE'
  })
}

const uploadMedia = ({ formData, credentials }) => {
  return fetch(MASTODON_MEDIA_UPLOAD_URL, {
    body: formData,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((data) => data.json())
    .then((data) => parseAttachment(data))
}

const setMediaDescription = ({ id, description, credentials }) => {
  return promisedRequest({
    url: `${MASTODON_MEDIA_UPLOAD_URL}/${id}`,
    method: 'PUT',
    headers: authHeaders(credentials),
    payload: {
      description
    }
  }).then((data) => parseAttachment(data))
}

const importMutes = ({ file, credentials }) => {
  const formData = new FormData()
  formData.append('list', file)
  return fetch(MUTES_IMPORT_URL, {
    body: formData,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.ok)
}

const importBlocks = ({ file, credentials }) => {
  const formData = new FormData()
  formData.append('list', file)
  return fetch(BLOCKS_IMPORT_URL, {
    body: formData,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.ok)
}

const importFollows = ({ file, credentials }) => {
  const formData = new FormData()
  formData.append('list', file)
  return fetch(FOLLOW_IMPORT_URL, {
    body: formData,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.ok)
}

const deleteAccount = ({ credentials, password }) => {
  const form = new FormData()

  form.append('password', password)

  return fetch(DELETE_ACCOUNT_URL, {
    body: form,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.json())
}

const changeEmail = ({ credentials, email, password }) => {
  const form = new FormData()

  form.append('email', email)
  form.append('password', password)

  return fetch(CHANGE_EMAIL_URL, {
    body: form,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.json())
}

const moveAccount = ({ credentials, password, targetAccount }) => {
  const form = new FormData()

  form.append('password', password)
  form.append('target_account', targetAccount)

  return fetch(MOVE_ACCOUNT_URL, {
    body: form,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.json())
}

const addAlias = ({ credentials, alias }) => {
  return promisedRequest({
    url: ALIASES_URL,
    method: 'PUT',
    credentials,
    payload: { alias }
  })
}

const deleteAlias = ({ credentials, alias }) => {
  return promisedRequest({
    url: ALIASES_URL,
    method: 'DELETE',
    credentials,
    payload: { alias }
  })
}

const listAliases = ({ credentials }) => {
  return promisedRequest({
    url: ALIASES_URL,
    method: 'GET',
    credentials,
    params: {
      _cacheBooster: (new Date()).getTime()
    }
  })
}

const changePassword = ({ credentials, password, newPassword, newPasswordConfirmation }) => {
  const form = new FormData()

  form.append('password', password)
  form.append('new_password', newPassword)
  form.append('new_password_confirmation', newPasswordConfirmation)

  return fetch(CHANGE_PASSWORD_URL, {
    body: form,
    method: 'POST',
    headers: authHeaders(credentials)
  })
    .then((response) => response.json())
}

const settingsMFA = ({ credentials }) => {
  return fetch(MFA_SETTINGS_URL, {
    headers: authHeaders(credentials),
    method: 'GET'
  }).then((data) => data.json())
}

const mfaDisableOTP = ({ credentials, password }) => {
  const form = new FormData()

  form.append('password', password)

  return fetch(MFA_DISABLE_OTP_URL, {
    body: form,
    method: 'DELETE',
    headers: authHeaders(credentials)
  })
    .then((response) => response.json())
}

const mfaConfirmOTP = ({ credentials, password, token }) => {
  const form = new FormData()

  form.append('password', password)
  form.append('code', token)

  return fetch(MFA_CONFIRM_OTP_URL, {
    body: form,
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}
const mfaSetupOTP = ({ credentials }) => {
  return fetch(MFA_SETUP_OTP_URL, {
    headers: authHeaders(credentials),
    method: 'GET'
  }).then((data) => data.json())
}
const generateMfaBackupCodes = ({ credentials }) => {
  return fetch(MFA_BACKUP_CODES_URL, {
    headers: authHeaders(credentials),
    method: 'GET'
  }).then((data) => data.json())
}

const fetchMutes = ({ maxId, credentials }) => {
  const query = new URLSearchParams({ with_relationships: true })
  if (maxId) {
    query.append('max_id', maxId)
  }
  return promisedRequest({ url: `${MASTODON_USER_MUTES_URL}?${query.toString()}`, credentials })
    .then((users) => users.map(parseUser))
}

const muteUser = ({ id, expiresIn, credentials }) => {
  const payload = {}
  if (expiresIn) {
    payload.expires_in = expiresIn
  }
  return promisedRequest({ url: MASTODON_MUTE_USER_URL(id), credentials, method: 'POST', payload })
}

const unmuteUser = ({ id, credentials }) => {
  return promisedRequest({ url: MASTODON_UNMUTE_USER_URL(id), credentials, method: 'POST' })
}

const fetchBlocks = ({ maxId, credentials }) => {
  const query = new URLSearchParams({ with_relationships: true })
  if (maxId) {
    query.append('max_id', maxId)
  }
  return promisedRequest({ url: `${MASTODON_USER_BLOCKS_URL}?${query.toString()}`, credentials })
    .then((users) => users.map(parseUser))
}

const addBackup = ({ credentials }) => {
  return promisedRequest({
    url: PLEROMA_BACKUP_URL,
    method: 'POST',
    credentials
  })
}

const listBackups = ({ credentials }) => {
  return promisedRequest({
    url: PLEROMA_BACKUP_URL,
    method: 'GET',
    credentials,
    params: {
      _cacheBooster: (new Date()).getTime()
    }
  })
}

const fetchOAuthTokens = ({ credentials }) => {
  const url = '/api/oauth_tokens.json'

  return fetch(url, {
    headers: authHeaders(credentials)
  }).then((data) => {
    if (data.ok) {
      return data.json()
    }
    throw new Error('Error fetching auth tokens', data)
  })
}

const revokeOAuthToken = ({ id, credentials }) => {
  const url = `/api/oauth_tokens/${id}`

  return fetch(url, {
    headers: authHeaders(credentials),
    method: 'DELETE'
  })
}

const suggestions = ({ credentials }) => {
  return fetch(SUGGESTIONS_URL, {
    headers: authHeaders(credentials)
  }).then((data) => data.json())
}

const markNotificationsAsSeen = ({ id, credentials, single = false }) => {
  const body = new FormData()

  if (single) {
    body.append('id', id)
  } else {
    body.append('max_id', id)
  }

  return fetch(NOTIFICATION_READ_URL, {
    body,
    headers: authHeaders(credentials),
    method: 'POST'
  }).then((data) => data.json())
}

const vote = ({ pollId, choices, credentials }) => {
  const form = new FormData()
  form.append('choices', choices)

  return promisedRequest({
    url: MASTODON_VOTE_URL(encodeURIComponent(pollId)),
    method: 'POST',
    credentials,
    payload: {
      choices
    }
  })
}

const fetchPoll = ({ pollId, credentials }) => {
  return promisedRequest(
    {
      url: MASTODON_POLL_URL(encodeURIComponent(pollId)),
      method: 'GET',
      credentials
    }
  )
}

const fetchFavoritedByUsers = ({ id, credentials }) => {
  return promisedRequest({
    url: MASTODON_STATUS_FAVORITEDBY_URL(id),
    method: 'GET',
    credentials
  }).then((users) => users.map(parseUser))
}

const fetchRebloggedByUsers = ({ id, credentials }) => {
  return promisedRequest({
    url: MASTODON_STATUS_REBLOGGEDBY_URL(id),
    method: 'GET',
    credentials
  }).then((users) => users.map(parseUser))
}

const fetchEmojiReactions = ({ id, credentials }) => {
  return promisedRequest({ url: PLEROMA_EMOJI_REACTIONS_URL(id), credentials })
    .then((reactions) => reactions.map(r => {
      r.accounts = r.accounts.map(parseUser)
      return r
    }))
}

const reactWithEmoji = ({ id, emoji, credentials }) => {
  return promisedRequest({
    url: PLEROMA_EMOJI_REACT_URL(id, emoji),
    method: 'PUT',
    credentials
  }).then(parseStatus)
}

const unreactWithEmoji = ({ id, emoji, credentials }) => {
  return promisedRequest({
    url: PLEROMA_EMOJI_UNREACT_URL(id, emoji),
    method: 'DELETE',
    credentials
  }).then(parseStatus)
}

const reportUser = ({ credentials, userId, statusIds, comment, forward }) => {
  return promisedRequest({
    url: MASTODON_REPORT_USER_URL,
    method: 'POST',
    payload: {
      account_id: userId,
      status_ids: statusIds,
      comment,
      forward
    },
    credentials
  })
}

const searchUsers = ({ credentials, query }) => {
  return promisedRequest({
    url: MASTODON_USER_SEARCH_URL,
    params: {
      q: query,
      resolve: true
    },
    credentials
  })
    .then((data) => data.map(parseUser))
}

const search2 = ({ credentials, q, resolve, limit, offset, following, type }) => {
  let url = MASTODON_SEARCH_2
  const params = []

  if (q) {
    params.push(['q', encodeURIComponent(q)])
  }

  if (resolve) {
    params.push(['resolve', resolve])
  }

  if (limit) {
    params.push(['limit', limit])
  }

  if (offset) {
    params.push(['offset', offset])
  }

  if (following) {
    params.push(['following', true])
  }

  if (type) {
    params.push(['following', type])
  }

  params.push(['with_relationships', true])

  const queryString = map(params, (param) => `${param[0]}=${param[1]}`).join('&')
  url += `?${queryString}`

  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => {
      if (data.ok) {
        return data
      }
      throw new Error('Error fetching search result', data)
    })
    .then((data) => { return data.json() })
    .then((data) => {
      data.accounts = data.accounts.slice(0, limit).map(u => parseUser(u))
      data.statuses = data.statuses.slice(0, limit).map(s => parseStatus(s))
      return data
    })
}

const fetchKnownDomains = ({ credentials }) => {
  return promisedRequest({ url: MASTODON_KNOWN_DOMAIN_LIST_URL, credentials })
}

const fetchDomainMutes = ({ credentials }) => {
  return promisedRequest({ url: MASTODON_DOMAIN_BLOCKS_URL, credentials })
}

const muteDomain = ({ domain, credentials }) => {
  return promisedRequest({
    url: MASTODON_DOMAIN_BLOCKS_URL,
    method: 'POST',
    payload: { domain },
    credentials
  })
}

const unmuteDomain = ({ domain, credentials }) => {
  return promisedRequest({
    url: MASTODON_DOMAIN_BLOCKS_URL,
    method: 'DELETE',
    payload: { domain },
    credentials
  })
}

const dismissNotification = ({ credentials, id }) => {
  return promisedRequest({
    url: MASTODON_DISMISS_NOTIFICATION_URL(id),
    method: 'POST',
    payload: { id },
    credentials
  })
}

const adminFetchAnnouncements = ({ credentials }) => {
  return promisedRequest({ url: PLEROMA_ANNOUNCEMENTS_URL, credentials })
}

const fetchAnnouncements = ({ credentials }) => {
  return promisedRequest({ url: MASTODON_ANNOUNCEMENTS_URL, credentials })
}

const dismissAnnouncement = ({ id, credentials }) => {
  return promisedRequest({
    url: MASTODON_ANNOUNCEMENTS_DISMISS_URL(id),
    credentials,
    method: 'POST'
  })
}

const announcementToPayload = ({ content, startsAt, endsAt, allDay }) => {
  const payload = { content }

  if (typeof startsAt !== 'undefined') {
    payload.starts_at = startsAt ? new Date(startsAt).toISOString() : null
  }

  if (typeof endsAt !== 'undefined') {
    payload.ends_at = endsAt ? new Date(endsAt).toISOString() : null
  }

  if (typeof allDay !== 'undefined') {
    payload.all_day = allDay
  }

  return payload
}

const postAnnouncement = ({ credentials, content, startsAt, endsAt, allDay }) => {
  return promisedRequest({
    url: PLEROMA_POST_ANNOUNCEMENT_URL,
    credentials,
    method: 'POST',
    payload: announcementToPayload({ content, startsAt, endsAt, allDay })
  })
}

const editAnnouncement = ({ id, credentials, content, startsAt, endsAt, allDay }) => {
  return promisedRequest({
    url: PLEROMA_EDIT_ANNOUNCEMENT_URL(id),
    credentials,
    method: 'PATCH',
    payload: announcementToPayload({ content, startsAt, endsAt, allDay })
  })
}

const deleteAnnouncement = ({ id, credentials }) => {
  return promisedRequest({
    url: PLEROMA_DELETE_ANNOUNCEMENT_URL(id),
    credentials,
    method: 'DELETE'
  })
}

export const getMastodonSocketURI = ({ credentials, stream, args = {} }, base) => {
  const url = new URL(MASTODON_STREAMING, base)
  if (credentials) {
    url.searchParams.append('access_token', credentials)
  }
  if (stream) {
    url.searchParams.append('stream', stream)
  }
  Object.entries(args).forEach(([key, val]) => {
    url.searchParams.append(key, val)
  })
  return url
}

const MASTODON_STREAMING_EVENTS = new Set([
  'update',
  'notification',
  'delete',
  'filters_changed',
  'status.update'
])

const PLEROMA_STREAMING_EVENTS = new Set([
  'pleroma:chat_update',
  'pleroma:respond'
])

// A thin wrapper around WebSocket API that allows adding a pre-processor to it
// Uses EventTarget and a CustomEvent to proxy events
export const ProcessedWS = ({
  url,
  preprocessor = handleMastoWS,
  id = 'Unknown',
  credentials
}) => {
  const eventTarget = new EventTarget()
  const socket = new WebSocket(url)
  if (!socket) throw new Error(`Failed to create socket ${id}`)
  const proxy = (original, eventName, processor = a => a) => {
    original.addEventListener(eventName, (eventData) => {
      eventTarget.dispatchEvent(new CustomEvent(
        eventName,
        { detail: processor(eventData) }
      ))
    })
  }
  socket.addEventListener('open', (wsEvent) => {
    console.debug(`[WS][${id}] Socket connected`, wsEvent)
    if (credentials) {
      socket.send(JSON.stringify({
        type: 'pleroma:authenticate',
        token: credentials
      }))
    }
  })
  socket.addEventListener('error', (wsEvent) => {
    console.debug(`[WS][${id}] Socket errored`, wsEvent)
  })
  socket.addEventListener('close', (wsEvent) => {
    console.debug(
      `[WS][${id}] Socket disconnected with code ${wsEvent.code}`,
      wsEvent
    )
  })
  // Commented code reason: very spammy, uncomment to enable message debug logging
  /*
  socket.addEventListener('message', (wsEvent) => {
    console.debug(
      `[WS][${id}] Message received`,
      wsEvent
    )
  })
  /**/

  const onAuthenticated = () => {
    eventTarget.dispatchEvent(new CustomEvent('pleroma:authenticated'))
  }

  proxy(socket, 'open')
  proxy(socket, 'close')
  proxy(socket, 'message', (event) => preprocessor(event, { onAuthenticated }))
  proxy(socket, 'error')

  // 1000 = Normal Closure
  eventTarget.close = () => { socket.close(1000, 'Shutting down socket') }
  eventTarget.getState = () => socket.readyState
  eventTarget.subscribe = (stream, args = {}) => {
    console.debug(
      `[WS][${id}] Subscribing to stream ${stream} with args`,
      args
    )
    socket.send(JSON.stringify({
      type: 'subscribe',
      stream,
      ...args
    }))
  }
  eventTarget.unsubscribe = (stream, args = {}) => {
    console.debug(
      `[WS][${id}] Unsubscribing from stream ${stream} with args`,
      args
    )
    socket.send(JSON.stringify({
      type: 'unsubscribe',
      stream,
      ...args
    }))
  }

  return eventTarget
}

export const handleMastoWS = (wsEvent, {
  onAuthenticated = () => {}
} = {}) => {
  const { data } = wsEvent
  if (!data) return
  const parsedEvent = JSON.parse(data)
  const { event, payload } = parsedEvent
  if (MASTODON_STREAMING_EVENTS.has(event) || PLEROMA_STREAMING_EVENTS.has(event)) {
    // MastoBE and PleromaBE both send payload for delete as a PLAIN string
    if (event === 'delete') {
      return { event, id: payload }
    }
    const data = payload ? JSON.parse(payload) : null
    if (event === 'pleroma:respond') {
      if (data.type === 'pleroma:authenticate') {
        if (data.result === 'success') {
          console.debug('[WS] Successfully authenticated')
          onAuthenticated()
        } else {
          console.error('[WS] Unable to authenticate:', data.error)
          wsEvent.target.close()
        }
      }
      return null
    } else if (event === 'update') {
      return { event, status: parseStatus(data) }
    } else if (event === 'status.update') {
      return { event, status: parseStatus(data) }
    } else if (event === 'notification') {
      return { event, notification: parseNotification(data) }
    } else if (event === 'pleroma:chat_update') {
      return { event, chatUpdate: parseChat(data) }
    }
  } else {
    console.warn('Unknown event', wsEvent)
    return null
  }
}

export const WSConnectionStatus = Object.freeze({
  JOINED: 1,
  CLOSED: 2,
  ERROR: 3,
  DISABLED: 4,
  STARTING: 5,
  STARTING_INITIAL: 6
})

const chats = ({ credentials }) => {
  return fetch(PLEROMA_CHATS_URL, { headers: authHeaders(credentials) })
    .then((data) => data.json())
    .then((data) => {
      return { chats: data.map(parseChat).filter(c => c) }
    })
}

const getOrCreateChat = ({ accountId, credentials }) => {
  return promisedRequest({
    url: PLEROMA_CHAT_URL(accountId),
    method: 'POST',
    credentials
  })
}

const chatMessages = ({ id, credentials, maxId, sinceId, limit = 20 }) => {
  let url = PLEROMA_CHAT_MESSAGES_URL(id)
  const args = [
    maxId && `max_id=${maxId}`,
    sinceId && `since_id=${sinceId}`,
    limit && `limit=${limit}`
  ].filter(_ => _).join('&')

  url = url + (args ? '?' + args : '')

  return promisedRequest({
    url,
    method: 'GET',
    credentials
  })
}

const sendChatMessage = ({ id, content, mediaId = null, idempotencyKey, credentials }) => {
  const payload = {
    content
  }

  if (mediaId) {
    payload.media_id = mediaId
  }

  const headers = {}

  if (idempotencyKey) {
    headers['idempotency-key'] = idempotencyKey
  }

  return promisedRequest({
    url: PLEROMA_CHAT_MESSAGES_URL(id),
    method: 'POST',
    payload,
    credentials,
    headers
  })
}

const readChat = ({ id, lastReadId, credentials }) => {
  return promisedRequest({
    url: PLEROMA_CHAT_READ_URL(id),
    method: 'POST',
    payload: {
      last_read_id: lastReadId
    },
    credentials
  })
}

const deleteChatMessage = ({ chatId, messageId, credentials }) => {
  return promisedRequest({
    url: PLEROMA_DELETE_CHAT_MESSAGE_URL(chatId, messageId),
    method: 'DELETE',
    credentials
  })
}

const setReportState = ({ id, state, credentials }) => {
  // TODO: Can't use promisedRequest because on OK this does not return json
  // See https://git.pleroma.social/pleroma/pleroma-fe/-/merge_requests/1322
  return fetch(PLEROMA_ADMIN_REPORTS, {
    headers: {
      ...authHeaders(credentials),
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify({
      reports: [{
        id,
        state
      }]
    })
  })
    .then(data => {
      if (data.status >= 500) {
        throw Error(data.statusText)
      } else if (data.status >= 400) {
        return data.json()
      }
      return data
    })
    .then(data => {
      if (data.errors) {
        throw Error(data.errors[0].message)
      }
    })
}

// ADMIN STUFF // EXPERIMENTAL
const fetchInstanceDBConfig = ({ credentials }) => {
  return fetch(PLEROMA_ADMIN_CONFIG_URL, {
    headers: authHeaders(credentials)
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
}

const fetchInstanceConfigDescriptions = ({ credentials }) => {
  return fetch(PLEROMA_ADMIN_DESCRIPTIONS_URL, {
    headers: authHeaders(credentials)
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
}

const fetchAvailableFrontends = ({ credentials }) => {
  return fetch(PLEROMA_ADMIN_FRONTENDS_URL, {
    headers: authHeaders(credentials)
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
}

const pushInstanceDBConfig = ({ credentials, payload }) => {
  return fetch(PLEROMA_ADMIN_CONFIG_URL, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(credentials)
    },
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
}

const installFrontend = ({ credentials, payload }) => {
  return fetch(PLEROMA_ADMIN_FRONTENDS_INSTALL_URL, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(credentials)
    },
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
}

const fetchScrobbles = ({ accountId, limit = 1 }) => {
  let url = PLEROMA_SCROBBLES_URL(accountId)
  const params = [['limit', limit]]
  const queryString = map(params, (param) => `${param[0]}=${param[1]}`).join('&')
  url += `?${queryString}`
  return fetch(url, {})
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {
          error: response
        }
      }
    })
}

const deleteEmojiPack = ({ name }) => {
  return fetch(PLEROMA_EMOJI_PACK_URL(name), { method: 'DELETE' })
}

const reloadEmoji = () => {
  return fetch(PLEROMA_EMOJI_RELOAD_URL, { method: 'POST' })
}

const importEmojiFromFS = () => {
  return fetch(PLEROMA_EMOJI_IMPORT_FS_URL)
}

const createEmojiPack = ({ name }) => {
  return fetch(PLEROMA_EMOJI_PACK_URL(name), { method: 'POST' })
}

const listEmojiPacks = ({ page, pageSize }) => {
  return fetch(PLEROMA_EMOJI_PACKS_URL(page, pageSize))
}

const listRemoteEmojiPacks = ({ instance, page, pageSize }) => {
  if (!instance.startsWith('http')) {
    instance = 'https://' + instance
  }

  return fetch(
    PLEROMA_EMOJI_PACKS_LS_REMOTE_URL(instance, page, pageSize),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

const downloadRemoteEmojiPack = ({ instance, packName, as }) => {
  return fetch(
    PLEROMA_EMOJI_PACKS_DL_REMOTE_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: instance, name: packName, as
      })
    }
  )
}

const saveEmojiPackMetadata = ({ name, newData }) => {
  return fetch(
    PLEROMA_EMOJI_PACK_URL(name),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: newData })
    }
  )
}

const addNewEmojiFile = ({ packName, file, shortcode, filename }) => {
  const data = new FormData()
  if (filename.trim() !== '') { data.set('filename', filename) }
  if (shortcode.trim() !== '') { data.set('shortcode', shortcode) }
  data.set('file', file)

  return fetch(
    PLEROMA_EMOJI_UPDATE_FILE_URL(packName),
    { method: 'POST', body: data }
  )
}

const updateEmojiFile = ({ packName, shortcode, newShortcode, newFilename, force }) => {
  return fetch(
    PLEROMA_EMOJI_UPDATE_FILE_URL(packName),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortcode, new_shortcode: newShortcode, new_filename: newFilename, force })
    }
  )
}

const deleteEmojiFile = ({ packName, shortcode }) => {
  return fetch(`${PLEROMA_EMOJI_UPDATE_FILE_URL(packName)}&shortcode=${shortcode}`, { method: 'DELETE' })
}

const fetchBookmarkFolders = ({ credentials }) => {
  const url = PLEROMA_BOOKMARK_FOLDERS_URL
  return fetch(url, { headers: authHeaders(credentials) })
    .then((data) => data.json())
}

const createBookmarkFolder = ({ name, emoji, credentials }) => {
  const url = PLEROMA_BOOKMARK_FOLDERS_URL
  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(url, {
    headers,
    method: 'POST',
    body: JSON.stringify({ name, emoji })
  }).then((data) => data.json())
}

const updateBookmarkFolder = ({ folderId, name, emoji, credentials }) => {
  const url = PLEROMA_BOOKMARK_FOLDER_URL(folderId)
  const headers = authHeaders(credentials)
  headers['Content-Type'] = 'application/json'

  return fetch(url, {
    headers,
    method: 'PATCH',
    body: JSON.stringify({ name, emoji })
  }).then((data) => data.json())
}

const deleteBookmarkFolder = ({ folderId, credentials }) => {
  const url = PLEROMA_BOOKMARK_FOLDER_URL(folderId)
  return fetch(url, {
    method: 'DELETE',
    headers: authHeaders(credentials)
  })
}

const apiService = {
  verifyCredentials,
  fetchTimeline,
  fetchPinnedStatuses,
  fetchConversation,
  fetchStatus,
  fetchStatusSource,
  fetchStatusHistory,
  fetchFriends,
  exportFriends,
  fetchFollowers,
  followUser,
  unfollowUser,
  pinOwnStatus,
  unpinOwnStatus,
  muteConversation,
  unmuteConversation,
  blockUser,
  unblockUser,
  removeUserFromFollowers,
  editUserNote,
  fetchUser,
  fetchUserByName,
  fetchUserRelationship,
  favorite,
  unfavorite,
  retweet,
  unretweet,
  bookmarkStatus,
  unbookmarkStatus,
  postStatus,
  editStatus,
  deleteStatus,
  uploadMedia,
  setMediaDescription,
  fetchMutes,
  muteUser,
  unmuteUser,
  fetchBlocks,
  fetchOAuthTokens,
  revokeOAuthToken,
  tagUser,
  untagUser,
  deleteUser,
  addRight,
  deleteRight,
  activateUser,
  deactivateUser,
  register,
  getCaptcha,
  updateProfileImages,
  updateProfile,
  importMutes,
  importBlocks,
  importFollows,
  deleteAccount,
  changeEmail,
  moveAccount,
  addAlias,
  deleteAlias,
  listAliases,
  changePassword,
  settingsMFA,
  mfaDisableOTP,
  generateMfaBackupCodes,
  mfaSetupOTP,
  mfaConfirmOTP,
  addBackup,
  listBackups,
  fetchFollowRequests,
  fetchLists,
  createList,
  getList,
  updateList,
  getListAccounts,
  addAccountsToList,
  removeAccountsFromList,
  deleteList,
  approveUser,
  denyUser,
  suggestions,
  markNotificationsAsSeen,
  dismissNotification,
  vote,
  fetchPoll,
  fetchFavoritedByUsers,
  fetchRebloggedByUsers,
  fetchEmojiReactions,
  reactWithEmoji,
  unreactWithEmoji,
  reportUser,
  updateNotificationSettings,
  search2,
  searchUsers,
  fetchKnownDomains,
  fetchDomainMutes,
  muteDomain,
  unmuteDomain,
  chats,
  getOrCreateChat,
  chatMessages,
  sendChatMessage,
  readChat,
  deleteChatMessage,
  setReportState,
  fetchUserInLists,
  fetchAnnouncements,
  dismissAnnouncement,
  postAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  fetchScrobbles,
  adminFetchAnnouncements,
  fetchInstanceDBConfig,
  fetchInstanceConfigDescriptions,
  fetchAvailableFrontends,
  pushInstanceDBConfig,
  installFrontend,
  importEmojiFromFS,
  reloadEmoji,
  listEmojiPacks,
  createEmojiPack,
  deleteEmojiPack,
  saveEmojiPackMetadata,
  addNewEmojiFile,
  updateEmojiFile,
  deleteEmojiFile,
  listRemoteEmojiPacks,
  downloadRemoteEmojiPack,
  fetchBookmarkFolders,
  createBookmarkFolder,
  updateBookmarkFolder,
  deleteBookmarkFolder
}

export default apiService
