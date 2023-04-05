import { createStore } from 'vuex'
import { createPinia } from 'pinia'

import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'

import interfaceModule from './modules/interface.js'
import instanceModule from './modules/instance.js'
import statusesModule from './modules/statuses.js'
import listsModule from './modules/lists.js'
import usersModule from './modules/users.js'
import apiModule from './modules/api.js'
import configModule from './modules/config.js'
import serverSideConfigModule from './modules/serverSideConfig.js'
import serverSideStorageModule from './modules/serverSideStorage.js'
import oauthModule from './modules/oauth.js'
import authFlowModule from './modules/auth_flow.js'
import oauthTokensModule from './modules/oauth_tokens.js'
import reportsModule from './modules/reports.js'
import pollsModule from './modules/polls.js'

import chatsModule from './modules/chats.js'
import announcementsModule from './modules/announcements.js'

import { createI18n } from 'vue-i18n'

import createPersistedState from './lib/persisted_state.js'
import pushNotifications from './lib/push_notifications_plugin.js'

import messages from './i18n/messages.js'

import afterStoreSetup from './boot/after_store.js'

const currentLocale = (window.navigator.language || 'en').split('-')[0]

const i18n = createI18n({
  // By default, use the browser locale, we will update it if neccessary
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages.default
})

messages.setLanguage(i18n, currentLocale)

const persistedStateOptions = {
  paths: [
    'serverSideStorage.cache',
    'config',
    'users.lastLoginName',
    'oauth'
  ]
};

(async () => {
  let storageError = false
  const plugins = [pushNotifications]
  const pinia = createPinia()
  try {
    const persistedState = await createPersistedState(persistedStateOptions)
    plugins.push(persistedState)
  } catch (e) {
    console.error(e)
    storageError = true
  }
  const store = createStore({
    modules: {
      interface: interfaceModule,
      instance: instanceModule,
      // TODO refactor users/statuses modules, they depend on each other
      users: usersModule,
      statuses: statusesModule,
      lists: listsModule,
      api: apiModule,
      config: configModule,
      serverSideConfig: serverSideConfigModule,
      serverSideStorage: serverSideStorageModule,
      oauth: oauthModule,
      authFlow: authFlowModule,
      oauthTokens: oauthTokensModule,
      reports: reportsModule,
      polls: pollsModule,
      chats: chatsModule,
      announcements: announcementsModule
    },
    plugins,
    strict: false // Socket modifies itself, let's ignore this for now.
    // strict: process.env.NODE_ENV !== 'production'
  })

  if (storageError) {
    store.dispatch('pushGlobalNotice', { messageKey: 'errors.storage_unavailable', level: 'error' })
  }

  // Temporarily passing both vuex and pinia stores until migration is fully complete.
  afterStoreSetup({ pinia, store, i18n })
})()

// These are inlined by webpack's DefinePlugin
/* eslint-disable */
window.___pleromafe_mode = process.env
window.___pleromafe_commit_hash = COMMIT_HASH
window.___pleromafe_dev_overrides = DEV_OVERRIDES
