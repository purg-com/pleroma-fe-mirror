
export const defaultState = {
  drafts: {}
}

export const mutations = {
  addOrSaveDraft (state, { draft }) {
    state.drafts[draft.id] = draft
  }
}

export const actions = {
  addOrSaveDraft (store, { draft }) {
    const id = draft.id || (new Date().getTime()).toString()
    store.commit('addOrSaveDraft', { draft: { ...draft, id } })
    return id
  }
}

export const getters = {
  draftsByTypeAndRefId (state) {
    return (type, refId) => {
      return Object.values(state.drafts).filter(draft => draft.type === type && draft.refId === refId)
    }
  }
}

const drafts = {
  state: defaultState,
  mutations,
  getters,
  actions
}

export default drafts
