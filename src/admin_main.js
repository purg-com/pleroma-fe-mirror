import { createStore } from 'vuex'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { createApp } from 'vue'

import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'

import { checkOAuthToken } from 'src/boot/after_store.js'

import interfaceModule from 'src/modules/interface.js'
import apiModule from 'src/modules/api.js'
import adminSettingsModule from 'src/modules/adminSettings.js'
import oauthModule from 'src/modules/oauth.js'
import configModule from 'src/modules/config.js'
import usersModule from 'src/modules/users.js'
import instanceModule from 'src/modules/instance.js'
import authFlowModule from 'src/modules/auth_flow.js'
import FaviconService from 'src/services/favicon_service/favicon_service.js'

import { createI18n } from 'vue-i18n'

import createPersistedState from 'src/lib/persisted_state.js'
import pushNotifications from 'src/lib/push_notifications_plugin.js'

import messages from 'src/i18n/messages.js'

import AppAdmin from 'src/AppAdmin.vue'

const currentLocale = (window.navigator.language || 'en').split('-')[0]

const i18n = createI18n({
  // By default, use the browser locale, we will update it if neccessary
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages.default
})

messages.setLanguage(i18n.global, currentLocale)

const persistedStateOptions = {
  paths: [
    'users.lastLoginName',
    'oauth'
  ]
};

(async () => {
  let storageError = false
  const plugins = [pushNotifications]
  try {
    const persistedState = await createPersistedState(persistedStateOptions)
    plugins.push(persistedState)
  } catch (e) {
    console.error(e)
    storageError = true
  }
  const store = createStore({
    modules: {
      i18n: {
        getters: {
          i18n: () => i18n.global
        }
      },
      interface: interfaceModule,
      instance: instanceModule,
      api: apiModule,
      adminSettings: adminSettingsModule,
      config: configModule,
      users: usersModule,
      oauth: oauthModule,
      authFlow: authFlowModule
    },
    plugins,
    strict: false // Socket modifies itself, let's ignore this for now.
    // strict: process.env.NODE_ENV !== 'production'
  })
  if (storageError) {
    store.dispatch('pushGlobalNotice', { messageKey: 'errors.storage_unavailable', level: 'error' })
  }

  FaviconService.initFaviconService()

  const overrides = window.___pleromafe_dev_overrides || {}
  const server = (typeof overrides.target !== 'undefined') ? overrides.target : window.location.origin
  store.dispatch('setInstanceOption', { name: 'server', value: server })

  // Now we can try getting the server settings and logging in
  // Most of these are preloaded into the index.html so blocking is minimized
  await Promise.all([
    checkOAuthToken({ store }, true)
  ])

  const app = createApp(AppAdmin)

  app.use(store)
  app.use(i18n)

  app.component('FAIcon', FontAwesomeIcon)
  app.component('FALayers', FontAwesomeLayers)

  // remove after vue 3.3
  app.config.unwrapInjectedRef = true

  app.mount('#app')
  document.body.classList.remove('hidden')
})()

// These are inlined by webpack's DefinePlugin
/* eslint-disable */
window.___pleromafe_mode = process.env
window.___pleromafe_commit_hash = COMMIT_HASH
window.___pleromafe_dev_overrides = DEV_OVERRIDES
