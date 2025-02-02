import { createStore } from 'vuex'
import { createPinia } from 'pinia'

import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'

import instanceModule from './modules/instance.js'
import statusesModule from './modules/statuses.js'
import notificationsModule from './modules/notifications.js'
import listsModule from './modules/lists.js'
import usersModule from './modules/users.js'
import apiModule from './modules/api.js'
import configModule from './modules/config.js'
import profileConfigModule from './modules/profileConfig.js'
import serverSideStorageModule from './modules/serverSideStorage.js'
import adminSettingsModule from './modules/adminSettings.js'
import oauthModule from './modules/oauth.js'
import authFlowModule from './modules/auth_flow.js'
import oauthTokensModule from './modules/oauth_tokens.js'
import draftsModule from './modules/drafts.js'
import chatsModule from './modules/chats.js'
import bookmarkFoldersModule from './modules/bookmark_folders.js'

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

messages.setLanguage(i18n.global, currentLocale)

const persistedStateOptions = {
  paths: [
    'serverSideStorage.cache',
    'config',
    'users.lastLoginName',
    'oauth'
  ]
};

(async () => {
  const isFox = Math.floor(Math.random() * 2) > 0 ? '_fox' : ''

  const splashError = (i18n, e) => {
    const throbber = document.querySelector('#throbber')
    throbber.addEventListener('animationend', () => {
      document.querySelector('#mascot').src = `/static/pleromatan_orz${isFox}.png`
    })
    throbber.classList.add('dead')
    document.querySelector('#status').textContent = i18n.global.t('splash.error')
    console.error('PleromaFE failed to initialize: ', e)
    document.querySelector('#statusError').textContent = e
    document.querySelector('#statusStack').textContent = e.stack
    document.querySelector('#statusError').style = 'display: block'
    document.querySelector('#statusStack').style = 'display: block'
  }

  window.splashError = e => splashError(i18n, e)
  window.splashUpdate = key => {
    if (document.querySelector('#status')) {
      document.querySelector('#status').textContent = i18n.global.t(key)
    }
  }

  try {
    let storageError
    const plugins = [pushNotifications]
    const pinia = createPinia()
    try {
      const persistedState = await createPersistedState(persistedStateOptions)
      plugins.push(persistedState)
    } catch (e) {
      console.error('Storage error', e)
      storageError = e
    }
    document.querySelector('#mascot').src = `/static/pleromatan_apology${isFox}.png`
    document.querySelector('#status').removeAttribute('class')
    document.querySelector('#status').textContent = i18n.global.t('splash.loading')
    document.querySelector('#splash-credit').textContent = i18n.global.t('update.art_by', { linkToArtist: 'pipivovott' })
    const store = createStore({
      modules: {
        instance: instanceModule,
        // TODO refactor users/statuses modules, they depend on each other
        users: usersModule,
        lists: listsModule,
        statuses: statusesModule,
        notifications: notificationsModule,
        api: apiModule,
        config: configModule,
        profileConfig: profileConfigModule,
        serverSideStorage: serverSideStorageModule,
        adminSettings: adminSettingsModule,
        oauth: oauthModule,
        authFlow: authFlowModule,
        oauthTokens: oauthTokensModule,
        drafts: draftsModule,
        chats: chatsModule,
        bookmarkFolders: bookmarkFoldersModule
      },
      plugins,
      options: {
        devtools: process.env.NODE_ENV !== 'production'
      },
      strict: false // Socket modifies itself, let's ignore this for now.
      // strict: process.env.NODE_ENV !== 'production'
    })
    window.vuex = store
    // Temporarily passing pinia and vuex stores along with storageError result until migration is fully complete.
    return await afterStoreSetup({ pinia, store, storageError, i18n })
  } catch (e) {
    splashError(i18n, e)
  }
})()

// These are inlined by webpack's DefinePlugin
/* eslint-disable */
window.___pleromafe_mode = process.env
window.___pleromafe_commit_hash = COMMIT_HASH
window.___pleromafe_dev_overrides = DEV_OVERRIDES
