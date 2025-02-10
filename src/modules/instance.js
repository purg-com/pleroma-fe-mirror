import apiService from '../services/api/api.service.js'
import { instanceDefaultProperties } from './config.js'
import { langCodeToCldrName, ensureFinalFallback } from '../i18n/languages.js'
import { useInterfaceStore } from 'src/stores/interface.js'

const SORTED_EMOJI_GROUP_IDS = [
  'smileys-and-emotion',
  'people-and-body',
  'animals-and-nature',
  'food-and-drink',
  'travel-and-places',
  'activities',
  'objects',
  'symbols',
  'flags'
]

const REGIONAL_INDICATORS = (() => {
  const start = 0x1F1E6
  const end = 0x1F1FF
  const A = 'A'.codePointAt(0)
  const res = new Array(end - start + 1)
  for (let i = start; i <= end; ++i) {
    const letter = String.fromCodePoint(A + i - start)
    res[i - start] = {
      replacement: String.fromCodePoint(i),
      imageUrl: false,
      displayText: 'regional_indicator_' + letter,
      displayTextI18n: {
        key: 'emoji.regional_indicator',
        args: { letter }
      }
    }
  }
  return res
})()

const REMOTE_INTERACTION_URL = '/main/ostatus'

const defaultState = {
  // Stuff from apiConfig
  name: 'Pleroma FE',
  registrationOpen: true,
  server: 'http://localhost:4040/',
  textlimit: 5000,
  themesIndex: undefined,
  stylesIndex: undefined,
  palettesIndex: undefined,
  themeData: undefined, // used for theme editor v2
  vapidPublicKey: undefined,

  // Stuff from static/config.json
  alwaysShowSubjectInput: true,
  defaultAvatar: '/images/avi.png',
  defaultBanner: '/images/banner.png',
  background: '/static/aurora_borealis.jpg',
  embeddedToS: true,
  collapseMessageWithSubject: false,
  greentext: false,
  useAtIcon: false,
  mentionLinkDisplay: 'short',
  mentionLinkShowTooltip: true,
  mentionLinkShowAvatar: false,
  mentionLinkFadeDomain: true,
  mentionLinkShowYous: false,
  mentionLinkBoldenYou: true,
  hideFilteredStatuses: false,
  // bad name: actually hides posts of muted USERS
  hideMutedPosts: false,
  hideMutedThreads: true,
  hideWordFilteredPosts: false,
  hidePostStats: false,
  hideBotIndication: false,
  hideSitename: false,
  hideUserStats: false,
  muteBotStatuses: false,
  muteSensitiveStatuses: false,
  modalOnRepeat: false,
  modalOnUnfollow: false,
  modalOnBlock: true,
  modalOnMute: false,
  modalOnMuteConversation: false,
  modalOnMuteDomain: true,
  modalOnDelete: true,
  modalOnLogout: true,
  modalOnApproveFollow: false,
  modalOnDenyFollow: false,
  modalOnRemoveUserFromFollowers: false,
  modalMobileCenter: false,
  loginMethod: 'password',
  logo: '/static/logo.svg',
  logoMargin: '.2em',
  logoMask: true,
  logoLeft: false,
  disableUpdateNotification: false,
  minimalScopesMode: false,
  nsfwCensorImage: undefined,
  postContentType: 'text/plain',
  redirectRootLogin: '/main/friends',
  redirectRootNoLogin: '/main/all',
  scopeCopy: true,
  showFeaturesPanel: true,
  showInstanceSpecificPanel: false,
  sidebarRight: false,
  subjectLineBehavior: 'email',
  theme: 'pleroma-dark',
  palette: null,
  style: null,
  emojiReactionsScale: 0.5,
  textSize: '14px',
  emojiSize: '2.2rem',
  navbarSize: '3.5rem',
  panelHeaderSize: '3.2rem',
  forcedRoundness: -1,
  fontsOverride: {},
  virtualScrolling: true,
  sensitiveByDefault: false,
  conversationDisplay: 'linear',
  conversationTreeAdvanced: false,
  conversationOtherRepliesButton: 'below',
  conversationTreeFadeAncestors: false,
  showExtraNotifications: true,
  showExtraNotificationsTip: true,
  showChatsInExtraNotifications: true,
  showAnnouncementsInExtraNotifications: true,
  showFollowRequestsInExtraNotifications: true,
  maxDepthInThread: 6,
  autocompleteSelect: false,
  closingDrawerMarksAsSeen: true,
  unseenAtTop: false,
  ignoreInactionableSeen: false,
  unsavedPostAction: 'confirm',
  autoSaveDraft: false,
  useAbsoluteTimeFormat: false,
  absoluteTimeFormatMinAge: '0d',
  absoluteTime12h: '24h',

  // Nasty stuff
  customEmoji: [],
  customEmojiFetched: false,
  emoji: {},
  emojiFetched: false,
  unicodeEmojiAnnotations: {},
  pleromaBackend: true,
  postFormats: [],
  restrictedNicknames: [],
  safeDM: true,
  knownDomains: [],
  birthdayRequired: false,
  birthdayMinAge: 0,

  // Feature-set, apparently, not everything here is reported...
  shoutAvailable: false,
  pleromaChatMessagesAvailable: false,
  pleromaCustomEmojiReactionsAvailable: false,
  pleromaBookmarkFoldersAvailable: false,
  gopherAvailable: false,
  mediaProxyAvailable: false,
  suggestionsEnabled: false,
  suggestionsWeb: '',
  quotingAvailable: false,
  groupActorAvailable: false,

  // Html stuff
  instanceSpecificPanelContent: '',
  tos: '',

  // Version Information
  backendVersion: '',
  backendRepository: '',
  frontendVersion: '',

  pollsAvailable: false,
  pollLimits: {
    max_options: 4,
    max_option_chars: 255,
    min_expiration: 60,
    max_expiration: 60 * 60 * 24
  }
}

const loadAnnotations = (lang) => {
  return import(
    /* webpackChunkName: "emoji-annotations/[request]" */
    `@kazvmoe-infra/unicode-emoji-json/annotations/${langCodeToCldrName(lang)}.json`
  )
    .then(k => k.default)
}

const injectAnnotations = (emoji, annotations) => {
  const availableLangs = Object.keys(annotations)

  return {
    ...emoji,
    annotations: availableLangs.reduce((acc, cur) => {
      acc[cur] = annotations[cur][emoji.replacement]
      return acc
    }, {})
  }
}

const injectRegionalIndicators = groups => {
  groups.symbols.push(...REGIONAL_INDICATORS)
  return groups
}

const instance = {
  state: defaultState,
  mutations: {
    setInstanceOption (state, { name, value }) {
      if (typeof value !== 'undefined') {
        state[name] = value
      }
    },
    setKnownDomains (state, domains) {
      state.knownDomains = domains
    },
    setUnicodeEmojiAnnotations (state, { lang, annotations }) {
      state.unicodeEmojiAnnotations[lang] = annotations
    }
  },
  getters: {
    instanceDefaultConfig (state) {
      return instanceDefaultProperties
        .map(key => [key, state[key]])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    },
    groupedCustomEmojis (state) {
      const packsOf = emoji => {
        const packs = emoji.tags
          .filter(k => k.startsWith('pack:'))
          .map(k => {
            const packName = k.slice(5) // remove 'pack:' prefix
            return {
              id: `custom-${packName}`,
              text: packName
            }
          })

        if (!packs.length) {
          return [{
            id: 'unpacked'
          }]
        } else {
          return packs
        }
      }

      return state.customEmoji
        .reduce((res, emoji) => {
          packsOf(emoji).forEach(({ id: packId, text: packName }) => {
            if (!res[packId]) {
              res[packId] = ({
                id: packId,
                text: packName,
                image: emoji.imageUrl,
                emojis: []
              })
            }
            res[packId].emojis.push(emoji)
          })
          return res
        }, {})
    },
    standardEmojiList (state) {
      return SORTED_EMOJI_GROUP_IDS
        .map(groupId => (state.emoji[groupId] || []).map(k => injectAnnotations(k, state.unicodeEmojiAnnotations)))
        .reduce((a, b) => a.concat(b), [])
    },
    standardEmojiGroupList (state) {
      return SORTED_EMOJI_GROUP_IDS.map(groupId => ({
        id: groupId,
        emojis: (state.emoji[groupId] || []).map(k => injectAnnotations(k, state.unicodeEmojiAnnotations))
      }))
    },
    instanceDomain (state) {
      return new URL(state.server).hostname
    },
    remoteInteractionLink (state) {
      const server = state.server.endsWith('/') ? state.server.slice(0, -1) : state.server
      const link = server + REMOTE_INTERACTION_URL

      return ({ statusId, nickname }) => {
        if (statusId) {
          return `${link}?status_id=${statusId}`
        } else {
          return `${link}?nickname=${nickname}`
        }
      }
    }
  },
  actions: {
    setInstanceOption ({ commit, dispatch }, { name, value }) {
      commit('setInstanceOption', { name, value })
      switch (name) {
        case 'name':
          useInterfaceStore().setPageTitle()
          break
        case 'shoutAvailable':
          if (value) {
            dispatch('initializeSocket')
          }
          break
      }
    },
    async getStaticEmoji ({ commit }) {
      try {
        const values = (await import(/* webpackChunkName: 'emoji' */ '../../static/emoji.json')).default

        const emoji = Object.keys(values).reduce((res, groupId) => {
          res[groupId] = values[groupId].map(e => ({
            displayText: e.slug,
            imageUrl: false,
            replacement: e.emoji
          }))
          return res
        }, {})
        commit('setInstanceOption', { name: 'emoji', value: injectRegionalIndicators(emoji) })
      } catch (e) {
        console.warn("Can't load static emoji\n", e)
      }
    },

    loadUnicodeEmojiData ({ commit, state }, language) {
      const langList = ensureFinalFallback(language)

      return Promise.all(
        langList
          .map(async lang => {
            if (!state.unicodeEmojiAnnotations[lang]) {
              try {
                const annotations = await loadAnnotations(lang)
                commit('setUnicodeEmojiAnnotations', { lang, annotations })
              } catch (e) {
                console.warn(`Error loading unicode emoji annotations for ${lang}: `, e)
                // ignore
              }
            }
          }))
    },

    async getCustomEmoji ({ commit, state }) {
      try {
        const res = await window.fetch('/api/pleroma/emoji.json')
        if (res.ok) {
          const result = await res.json()
          const values = Array.isArray(result) ? Object.assign({}, ...result) : result
          const caseInsensitiveStrCmp = (a, b) => {
            const la = a.toLowerCase()
            const lb = b.toLowerCase()
            return la > lb ? 1 : (la < lb ? -1 : 0)
          }
          const noPackLast = (a, b) => {
            const aNull = a === ''
            const bNull = b === ''
            if (aNull === bNull) {
              return 0
            } else if (aNull && !bNull) {
              return 1
            } else {
              return -1
            }
          }
          const byPackThenByName = (a, b) => {
            const packOf = emoji => (emoji.tags.filter(k => k.startsWith('pack:'))[0] || '').slice(5)
            const packOfA = packOf(a)
            const packOfB = packOf(b)
            return noPackLast(packOfA, packOfB) || caseInsensitiveStrCmp(packOfA, packOfB) || caseInsensitiveStrCmp(a.displayText, b.displayText)
          }

          const emoji = Object.entries(values).map(([key, value]) => {
            const imageUrl = value.image_url
            return {
              displayText: key,
              imageUrl: imageUrl ? state.server + imageUrl : value,
              tags: imageUrl ? value.tags.sort((a, b) => a > b ? 1 : 0) : ['utf'],
              replacement: `:${key}: `
            }
            // Technically could use tags but those are kinda useless right now,
            // should have been "pack" field, that would be more useful
          }).sort(byPackThenByName)
          commit('setInstanceOption', { name: 'customEmoji', value: emoji })
        } else {
          throw (res)
        }
      } catch (e) {
        console.warn("Can't load custom emojis\n", e)
      }
    },
    fetchEmoji ({ dispatch, state }) {
      if (!state.customEmojiFetched) {
        state.customEmojiFetched = true
        dispatch('getCustomEmoji')
      }
      if (!state.emojiFetched) {
        state.emojiFetched = true
        dispatch('getStaticEmoji')
      }
    },

    async getKnownDomains ({ commit, rootState }) {
      try {
        const result = await apiService.fetchKnownDomains({
          credentials: rootState.users.currentUser.credentials
        })
        commit('setKnownDomains', result)
      } catch (e) {
        console.warn("Can't load known domains\n", e)
      }
    }
  }
}

export default instance
