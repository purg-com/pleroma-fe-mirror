import { remove, find } from 'lodash'

export const defaultState = {
  allFolders: []
}

export const mutations = {
  setBookmarkFolders (state, value) {
    state.allFolders = value
  },
  setBookmarkFolder (state, { folderId, name, emoji, emojiUrl }) {
    const entry = find(state.allFolders, { id: name })
    if (!entry) {
      state.allFolders.push({ id: folderId, name, emoji, emojiUrl })
    } else {
      entry.name = name
      entry.emoji = emoji
      entry.emojiUrl = emojiUrl
    }
  },
  deleteBookmarkFolder (state, { folderId }) {
    remove(state.allFolders, folder => folder.id === folderId)
  }
}

const actions = {
  setBookmarkFolders ({ commit }, value) {
    commit('setBookmarkFolders', value)
  },
  createBookmarkFolder ({ rootState, commit }, { name, emoji }) {
    return rootState.api.backendInteractor.createBookmarkFolder({ name, emoji })
      .then((folder) => {
        commit('setBookmarkFolder', folder)
        return folder
      })
  },
  setBookmarkFolder ({ rootState, commit }, { folderId, name, emoji }) {
    return rootState.api.backendInteractor.updateBookmarkFolder({ folderId, name, emoji })
      .then((folder) => {
        commit('setBookmarkFolder', folder)
        return folder
      })
  },
  deleteBookmarkFolder ({ rootState, commit }, { folderId }) {
    rootState.api.backendInteractor.deleteBookmarkFolder({ folderId })
    commit('deleteBookmarkFolder', { folderId })
  }
}

export const getters = {
  findBookmarkFolderName: state => id => {
    const folder = state.allFolders.find(folder => folder.id === id)

    if (!folder) return
    return folder.name
  }
}

const bookmarkFolders = {
  state: defaultState,
  mutations,
  actions,
  getters
}

export default bookmarkFolders
