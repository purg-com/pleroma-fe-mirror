import { createApp, getClientToken, verifyAppToken } from 'src/services/new_api/oauth.js'

// status codes about verifyAppToken (GET /api/v1/apps/verify_credentials)
const isAppTokenRejected = error => (
  // Pleroma API docs say it returns 422 when unauthorized
  error.statusCode === 422 ||
  // but it actually returns 400 (as of 2.9.0)
  // NOTE: don't try to match against the error message, it is translatable
  error.statusCode === 400 ||
  // and Mastodon docs say it returns 401
  error.statusCode === 401
)

// status codes about getAppToken (GET /oauth/token)
const isClientDataRejected = error => (
  // Mastodon docs say it returns 401
  error.statusCode === 401 ||
  // but Pleroma actually returns 400 (as of 2.9.0)
  // NOTE: don't try to match against the error message, it is translatable
  error.statusCode === 400
)

const oauth = {
  state: () => ({
    clientId: false,
    clientSecret: false,
    /* App token is authentication for app without any user, used mostly for
     * MastoAPI's registration of new users, stored so that we can fall back to
     * it on logout
     */
    appToken: false,
    /* User token is authentication for app with user, this is for every calls
     * that need authorized user to be successful (i.e. posting, liking etc)
     */
    userToken: false
  }),
  mutations: {
    setClientData (state, { clientId, clientSecret }) {
      state.clientId = clientId
      state.clientSecret = clientSecret
    },
    setAppToken (state, token) {
      state.appToken = token
    },
    setToken (state, token) {
      state.userToken = token
    },
    clearToken (state) {
      state.userToken = false
      // state.token is userToken with older name, coming from persistent state
      // let's clear it as well, since it is being used as a fallback of state.userToken
      delete state.token
    }
  },
  getters: {
    getToken: state => () => {
      // state.token is userToken with older name, coming from persistent state
      // added here for smoother transition, otherwise user will be logged out
      return state.userToken || state.token || state.appToken
    },
    getUserToken: state => () => {
      // state.token is userToken with older name, coming from persistent state
      // added here for smoother transition, otherwise user will be logged out
      return state.userToken || state.token
    }
  },
  actions: {
    async createApp ({ rootState, commit }) {
      const instance = rootState.instance.server
      const app = await createApp(instance)
      commit('setClientData', app)
      return app
    },
    /// Use this if you want to get the client id and secret but are not interested
    /// in whether they are valid.
    /// @return {{ clientId: string, clientSecret: string }} An object representing the app
    ensureApp ({ state, dispatch }) {
      if (state.clientId && state.clientSecret) {
        return {
          clientId: state.clientId,
          clientSecret: state.clientSecret
        }
      } else {
        return dispatch('createApp')
      }
    },
    async getAppToken ({ state, rootState, commit }) {
      const res = await getClientToken({
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        instance: rootState.instance.server
      })
      commit('setAppToken', res.access_token)
      return res.access_token
    },
    /// Use this if you want to ensure the app is still valid to use.
    /// @return {string} The access token to the app (not attached to any user)
    async ensureAppToken ({ state, rootState, dispatch, commit }) {
      if (state.appToken) {
        try {
          await verifyAppToken({
            instance: rootState.instance.server,
            appToken: state.appToken
          })
          return state.appToken
        } catch (e) {
          if (!isAppTokenRejected(e)) {
            // The server did not reject our token, but we encountered other problems. Maybe the server is down.
            throw e
          } else {
            // The app token is rejected, so it is no longer useful.
            commit('setAppToken', false)
          }
        }
      }

      // appToken is not available, or is rejected: try to get a new one.
      // First, make sure the client id and client secret are filled.
      try {
        await dispatch('ensureApp')
      } catch (e) {
        console.error('Cannot create app', e)
        throw e
      }

      // Note that at this step, the client id and secret may be invalid
      // (because the backend may have already deleted the app due to no user login)
      try {
        return await dispatch('getAppToken')
      } catch (e) {
        if (!isClientDataRejected(e)) {
          // Non-credentials problem, fail fast
          console.error('Cannot get app token', e)
          throw e
        } else {
          // the client id and secret are invalid, so we should clear them
          // and re-create our app
          commit('setClientData', {
            clientId: false,
            clientSecret: false
          })
          await dispatch('createApp')
          // try once again to get the token
          return await dispatch('getAppToken')
        }
      }
    }
  }
}

export default oauth
