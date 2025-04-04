import { reactive } from 'vue'
import { find, omitBy, orderBy, sumBy } from 'lodash'
import chatService from '../services/chat_service/chat_service.js'
import { parseChat, parseChatMessage } from '../services/entity_normalizer/entity_normalizer.service.js'
import { maybeShowChatNotification } from '../services/chat_utils/chat_utils.js'
import { promiseInterval } from '../services/promise_interval/promise_interval.js'

const emptyChatList = () => ({
  data: [],
  idStore: {}
})

const defaultState = {
  chatList: emptyChatList(),
  chatListFetcher: null,
  openedChats: reactive({}),
  openedChatMessageServices: reactive({}),
  fetcher: undefined,
  currentChatId: null,
  lastReadMessageId: null
}

const getChatById = (state, id) => {
  return find(state.chatList.data, { id })
}

const sortedChatList = (state) => {
  return orderBy(state.chatList.data, ['updated_at'], ['desc'])
}

const unreadChatCount = (state) => {
  return sumBy(state.chatList.data, 'unread')
}

const chats = {
  state: { ...defaultState },
  getters: {
    currentChat: state => state.openedChats[state.currentChatId],
    currentChatMessageService: state => state.openedChatMessageServices[state.currentChatId],
    findOpenedChatByRecipientId: state => recipientId => find(state.openedChats, c => c.account.id === recipientId),
    sortedChatList,
    unreadChatCount
  },
  actions: {
    // Chat list
    startFetchingChats ({ dispatch, commit }) {
      const fetcher = () => dispatch('fetchChats', { latest: true })
      fetcher()
      commit('setChatListFetcher', {
        fetcher: () => promiseInterval(fetcher, 5000)
      })
    },
    stopFetchingChats ({ commit }) {
      commit('setChatListFetcher', { fetcher: undefined })
    },
    fetchChats ({ dispatch, rootState }) {
      return rootState.api.backendInteractor.chats()
        .then(({ chats }) => {
          dispatch('addNewChats', { chats })
          return chats
        })
    },
    addNewChats (store, { chats }) {
      const { commit, dispatch, rootGetters } = store
      const newChatMessageSideEffects = (chat) => {
        maybeShowChatNotification(store, chat)
      }
      commit('addNewUsers', chats.map(k => k.account).filter(k => k))
      commit('addNewChats', { dispatch, chats, rootGetters, newChatMessageSideEffects })
    },
    updateChat ({ commit }, { chat }) {
      commit('updateChat', { chat })
    },

    // Opened Chats
    startFetchingCurrentChat ({ dispatch }, { fetcher }) {
      dispatch('setCurrentChatFetcher', { fetcher })
    },
    setCurrentChatFetcher ({ commit }, { fetcher }) {
      commit('setCurrentChatFetcher', { fetcher })
    },
    addOpenedChat ({ commit, dispatch }, { chat }) {
      commit('addOpenedChat', { dispatch, chat: parseChat(chat) })
      dispatch('addNewUsers', [chat.account])
    },
    addChatMessages ({ commit }, value) {
      commit('addChatMessages', { commit, ...value })
    },
    resetChatNewMessageCount ({ commit }, value) {
      commit('resetChatNewMessageCount', value)
    },
    clearCurrentChat ({ commit }) {
      commit('setCurrentChatId', { chatId: undefined })
      commit('setCurrentChatFetcher', { fetcher: undefined })
    },
    readChat ({ rootState, commit, dispatch }, { id, lastReadId }) {
      const isNewMessage = rootState.chats.lastReadMessageId !== lastReadId

      dispatch('resetChatNewMessageCount')
      commit('readChat', { id, lastReadId })

      if (isNewMessage) {
        rootState.api.backendInteractor.readChat({ id, lastReadId })
      }
    },
    deleteChatMessage ({ rootState, commit }, value) {
      rootState.api.backendInteractor.deleteChatMessage(value)
      commit('deleteChatMessage', { commit, ...value })
    },
    resetChats ({ commit, dispatch }) {
      dispatch('clearCurrentChat')
      commit('resetChats', { commit })
    },
    clearOpenedChats ({ commit }) {
      commit('clearOpenedChats', { commit })
    },
    handleMessageError ({ commit }, value) {
      commit('handleMessageError', { commit, ...value })
    },
    cullOlderMessages ({ commit }, chatId) {
      commit('cullOlderMessages', chatId)
    }
  },
  mutations: {
    setChatListFetcher (state, { fetcher }) {
      const prevFetcher = state.chatListFetcher
      if (prevFetcher) {
        prevFetcher.stop()
      }
      state.chatListFetcher = fetcher && fetcher()
    },
    setCurrentChatFetcher (state, { fetcher }) {
      const prevFetcher = state.fetcher
      if (prevFetcher) {
        prevFetcher.stop()
      }
      state.fetcher = fetcher && fetcher()
    },
    addOpenedChat (state, { chat }) {
      state.currentChatId = chat.id
      state.openedChats[chat.id] = chat

      if (!state.openedChatMessageServices[chat.id]) {
        state.openedChatMessageServices[chat.id] = chatService.empty(chat.id)
      }
    },
    setCurrentChatId (state, { chatId }) {
      state.currentChatId = chatId
    },
    addNewChats (state, { chats, newChatMessageSideEffects }) {
      chats.forEach((updatedChat) => {
        const chat = getChatById(state, updatedChat.id)

        if (chat) {
          const isNewMessage = (chat.lastMessage && chat.lastMessage.id) !== (updatedChat.lastMessage && updatedChat.lastMessage.id)
          chat.lastMessage = updatedChat.lastMessage
          chat.unread = updatedChat.unread
          chat.updated_at = updatedChat.updated_at
          if (isNewMessage && chat.unread) {
            newChatMessageSideEffects(updatedChat)
          }
        } else {
          state.chatList.data.push(updatedChat)
          state.chatList.idStore[updatedChat.id] = updatedChat
        }
      })
    },
    updateChat (state, { chat: updatedChat }) {
      const chat = getChatById(state, updatedChat.id)
      if (chat) {
        chat.lastMessage = updatedChat.lastMessage
        chat.unread = updatedChat.unread
        chat.updated_at = updatedChat.updated_at
      }
      if (!chat) { state.chatList.data.unshift(updatedChat) }
      state.chatList.idStore[updatedChat.id] = updatedChat
    },
    deleteChat (state, { id }) {
      state.chats.data = state.chats.data.filter(conversation =>
        conversation.last_status.id !== id
      )
      state.chats.idStore = omitBy(state.chats.idStore, conversation => conversation.last_status.id === id)
    },
    resetChats (state, { commit }) {
      state.chatList = emptyChatList()
      state.currentChatId = null
      commit('setChatListFetcher', { fetcher: undefined })
      for (const chatId in state.openedChats) {
        chatService.clear(state.openedChatMessageServices[chatId])
        delete state.openedChats[chatId]
        delete state.openedChatMessageServices[chatId]
      }
    },
    setChatsLoading (state, { value }) {
      state.chats.loading = value
    },
    addChatMessages (state, { chatId, messages, updateMaxId }) {
      const chatMessageService = state.openedChatMessageServices[chatId]
      if (chatMessageService) {
        chatService.add(chatMessageService, { messages: messages.map(parseChatMessage), updateMaxId })
      }
    },
    deleteChatMessage (state, { chatId, messageId }) {
      const chatMessageService = state.openedChatMessageServices[chatId]
      if (chatMessageService) {
        chatService.deleteMessage(chatMessageService, messageId)
      }
    },
    resetChatNewMessageCount (state) {
      const chatMessageService = state.openedChatMessageServices[state.currentChatId]
      chatService.resetNewMessageCount(chatMessageService)
    },
    // Used when a connection loss occurs
    clearOpenedChats (state) {
      const currentChatId = state.currentChatId
      for (const chatId in state.openedChats) {
        if (currentChatId !== chatId) {
          chatService.clear(state.openedChatMessageServices[chatId])
          delete state.openedChats[chatId]
          delete state.openedChatMessageServices[chatId]
        }
      }
    },
    readChat (state, { id, lastReadId }) {
      state.lastReadMessageId = lastReadId
      const chat = getChatById(state, id)
      if (chat) {
        chat.unread = 0
      }
    },
    handleMessageError (state, { chatId, fakeId, isRetry }) {
      const chatMessageService = state.openedChatMessageServices[chatId]
      chatService.handleMessageError(chatMessageService, fakeId, isRetry)
    },
    cullOlderMessages (state, chatId) {
      chatService.cullOlderMessages(state.openedChatMessageServices[chatId])
    }
  }
}

export default chats
