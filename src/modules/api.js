import backendInteractorService from '../services/backend_interactor_service/backend_interactor_service.js'
import { WSConnectionStatus } from '../services/api/api.service.js'
import { maybeShowChatNotification } from '../services/chat_utils/chat_utils.js'
import { Socket } from 'phoenix'
import { useShoutStore } from 'src/stores/shout.js'
import { useInterfaceStore } from 'src/stores/interface.js'

const retryTimeout = (multiplier) => 1000 * multiplier

const api = {
  state: {
    retryMultiplier: 1,
    backendInteractor: backendInteractorService(),
    fetchers: {},
    socket: null,
    mastoUserSocket: null,
    mastoUserSocketStatus: null,
    followRequests: []
  },
  getters: {
    followRequestCount: state => state.followRequests.length
  },
  mutations: {
    setBackendInteractor (state, backendInteractor) {
      state.backendInteractor = backendInteractor
    },
    addFetcher (state, { fetcherName, fetcher }) {
      state.fetchers[fetcherName] = fetcher
    },
    removeFetcher (state, { fetcherName }) {
      state.fetchers[fetcherName].stop()
      delete state.fetchers[fetcherName]
    },
    setWsToken (state, token) {
      state.wsToken = token
    },
    setSocket (state, socket) {
      state.socket = socket
    },
    setFollowRequests (state, value) {
      state.followRequests = value
    },
    setMastoUserSocketStatus (state, value) {
      state.mastoUserSocketStatus = value
    },
    incrementRetryMultiplier (state) {
      state.retryMultiplier = Math.max(++state.retryMultiplier, 3)
    },
    resetRetryMultiplier (state) {
      state.retryMultiplier = 1
    }
  },
  actions: {
    /**
     * Global MastoAPI socket control, in future should disable ALL sockets/(re)start relevant sockets
     *
     * @param {Boolean} [initial] - whether this enabling happened at boot time or not
     */
    enableMastoSockets (store, initial) {
      const { state, dispatch, commit } = store
      // Do not initialize unless nonexistent or closed
      if (
        state.mastoUserSocket &&
          ![
            WebSocket.CLOSED,
            WebSocket.CLOSING
          ].includes(state.mastoUserSocket.getState())
      ) {
        return
      }
      if (initial) {
        commit('setMastoUserSocketStatus', WSConnectionStatus.STARTING_INITIAL)
      } else {
        commit('setMastoUserSocketStatus', WSConnectionStatus.STARTING)
      }
      return dispatch('startMastoUserSocket')
    },
    disableMastoSockets (store) {
      const { state, dispatch, commit } = store
      if (!state.mastoUserSocket) return
      commit('setMastoUserSocketStatus', WSConnectionStatus.DISABLED)
      return dispatch('stopMastoUserSocket')
    },

    // MastoAPI 'User' sockets
    startMastoUserSocket (store) {
      return new Promise((resolve, reject) => {
        try {
          const { state, commit, dispatch, rootState } = store
          const timelineData = rootState.statuses.timelines.friends
          state.mastoUserSocket = state.backendInteractor.startUserSocket({ store })
          state.mastoUserSocket.addEventListener('pleroma:authenticated', () => {
            state.mastoUserSocket.subscribe('user')
          })
          state.mastoUserSocket.addEventListener(
            'message',
            ({ detail: message }) => {
              if (!message) return // pings
              if (message.event === 'notification') {
                dispatch('addNewNotifications', {
                  notifications: [message.notification],
                  older: false
                })
              } else if (message.event === 'update') {
                dispatch('addNewStatuses', {
                  statuses: [message.status],
                  userId: false,
                  showImmediately: timelineData.visibleStatuses.length === 0,
                  timeline: 'friends'
                })
              } else if (message.event === 'status.update') {
                dispatch('addNewStatuses', {
                  statuses: [message.status],
                  userId: false,
                  showImmediately: message.status.id in timelineData.visibleStatusesObject,
                  timeline: 'friends'
                })
              } else if (message.event === 'delete') {
                dispatch('deleteStatusById', message.id)
              } else if (message.event === 'pleroma:chat_update') {
                // The setTimeout wrapper is a temporary band-aid to avoid duplicates for the user's own messages when doing optimistic sending.
                // The cause of the duplicates is the WS event arriving earlier than the HTTP response.
                // This setTimeout wrapper can be removed once the commit `8e41baff` is in the stable Pleroma release.
                // (`8e41baff` adds the idempotency key to the chat message entity, which PleromaFE uses when it's available, and it makes this artificial delay unnecessary).
                setTimeout(() => {
                  dispatch('addChatMessages', {
                    chatId: message.chatUpdate.id,
                    messages: [message.chatUpdate.lastMessage]
                  })
                  dispatch('updateChat', { chat: message.chatUpdate })
                  maybeShowChatNotification(store, message.chatUpdate)
                }, 100)
              }
            }
          )
          state.mastoUserSocket.addEventListener('open', () => {
            // Do not show notification when we just opened up the page
            if (state.mastoUserSocketStatus !== WSConnectionStatus.STARTING_INITIAL) {
              useInterfaceStore().pushGlobalNotice({
                level: 'success',
                messageKey: 'timeline.socket_reconnected',
                timeout: 5000
              })
            }
            // Stop polling if we were errored or disabled
            if (new Set([
              WSConnectionStatus.ERROR,
              WSConnectionStatus.DISABLED
            ]).has(state.mastoUserSocketStatus)) {
              dispatch('stopFetchingTimeline', { timeline: 'friends' })
              dispatch('stopFetchingNotifications')
              dispatch('stopFetchingChats')
            }
            commit('resetRetryMultiplier')
            commit('setMastoUserSocketStatus', WSConnectionStatus.JOINED)
          })
          state.mastoUserSocket.addEventListener('error', ({ detail: error }) => {
            console.error('Error in MastoAPI websocket:', error)
            // TODO is this needed?
            dispatch('clearOpenedChats')
          })
          state.mastoUserSocket.addEventListener('close', ({ detail: closeEvent }) => {
            const ignoreCodes = new Set([
              1000, // Normal (intended) closure
              1001 // Going away
            ])
            const { code } = closeEvent
            if (ignoreCodes.has(code)) {
              console.debug(`Not restarting socket becasue of closure code ${code} is in ignore list`)
              commit('setMastoUserSocketStatus', WSConnectionStatus.CLOSED)
            } else {
              console.warn(`MastoAPI websocket disconnected, restarting. CloseEvent code: ${code}`)
              setTimeout(() => {
                dispatch('startMastoUserSocket')
              }, retryTimeout(state.retryMultiplier))
              commit('incrementRetryMultiplier')
              if (state.mastoUserSocketStatus !== WSConnectionStatus.ERROR) {
                dispatch('startFetchingTimeline', { timeline: 'friends' })
                dispatch('startFetchingNotifications')
                dispatch('startFetchingChats')
                useInterfaceStore().pushGlobalNotice({
                  level: 'error',
                  messageKey: 'timeline.socket_broke',
                  messageArgs: [code],
                  timeout: 5000
                })
              }
              commit('setMastoUserSocketStatus', WSConnectionStatus.ERROR)
            }
            dispatch('clearOpenedChats')
          })
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    },
    stopMastoUserSocket ({ state, dispatch }) {
      dispatch('startFetchingTimeline', { timeline: 'friends' })
      dispatch('startFetchingNotifications')
      dispatch('startFetchingChats')
      state.mastoUserSocket.close()
    },

    // Timelines
    startFetchingTimeline (store, {
      timeline = 'friends',
      tag = false,
      userId = false,
      listId = false,
      statusId = false,
      bookmarkFolderId = false
    }) {
      if (store.state.fetchers[timeline]) return

      const fetcher = store.state.backendInteractor.startFetchingTimeline({
        timeline, store, userId, listId, statusId, bookmarkFolderId, tag
      })
      store.commit('addFetcher', { fetcherName: timeline, fetcher })
    },
    stopFetchingTimeline (store, timeline) {
      const fetcher = store.state.fetchers[timeline]
      if (!fetcher) return
      store.commit('removeFetcher', { fetcherName: timeline, fetcher })
    },
    fetchTimeline (store, { timeline, ...rest }) {
      store.state.backendInteractor.fetchTimeline({
        store,
        timeline,
        ...rest
      })
    },

    // Notifications
    startFetchingNotifications (store) {
      if (store.state.fetchers.notifications) return
      const fetcher = store.state.backendInteractor.startFetchingNotifications({ store })
      store.commit('addFetcher', { fetcherName: 'notifications', fetcher })
    },
    stopFetchingNotifications (store) {
      const fetcher = store.state.fetchers.notifications
      if (!fetcher) return
      store.commit('removeFetcher', { fetcherName: 'notifications', fetcher })
    },
    fetchNotifications (store, { ...rest }) {
      store.state.backendInteractor.fetchNotifications({
        store,
        ...rest
      })
    },

    // Follow requests
    startFetchingFollowRequests (store) {
      if (store.state.fetchers.followRequests) return
      const fetcher = store.state.backendInteractor.startFetchingFollowRequests({ store })

      store.commit('addFetcher', { fetcherName: 'followRequests', fetcher })
    },
    stopFetchingFollowRequests (store) {
      const fetcher = store.state.fetchers.followRequests
      if (!fetcher) return
      store.commit('removeFetcher', { fetcherName: 'followRequests', fetcher })
    },
    removeFollowRequest (store, request) {
      const requests = store.state.followRequests.filter((it) => it !== request)
      store.commit('setFollowRequests', requests)
    },

    // Lists
    startFetchingLists (store) {
      if (store.state.fetchers.lists) return
      const fetcher = store.state.backendInteractor.startFetchingLists({ store })
      store.commit('addFetcher', { fetcherName: 'lists', fetcher })
    },
    stopFetchingLists (store) {
      const fetcher = store.state.fetchers.lists
      if (!fetcher) return
      store.commit('removeFetcher', { fetcherName: 'lists', fetcher })
    },

    // Bookmark folders
    startFetchingBookmarkFolders (store) {
      if (store.state.fetchers.bookmarkFolders) return
      const fetcher = store.state.backendInteractor.startFetchingBookmarkFolders({ store })
      store.commit('addFetcher', { fetcherName: 'bookmarkFolders', fetcher })
    },
    stopFetchingBookmarkFolders (store) {
      const fetcher = store.state.fetchers.bookmarkFolders
      if (!fetcher) return
      store.commit('removeFetcher', { fetcherName: 'bookmarkFolders', fetcher })
    },

    // Pleroma websocket
    setWsToken (store, token) {
      store.commit('setWsToken', token)
    },
    initializeSocket ({ commit, state, rootState }) {
      // Set up websocket connection
      const token = state.wsToken
      if (rootState.instance.shoutAvailable && typeof token !== 'undefined' && state.socket === null) {
        const socket = new Socket('/socket', { params: { token } })
        socket.connect()

        commit('setSocket', socket)
        useShoutStore().initializeShout(socket)
      }
    },
    disconnectFromSocket ({ commit, state }) {
      state.socket && state.socket.disconnect()
      commit('setSocket', null)
    }
  }
}

export default api
