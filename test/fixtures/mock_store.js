import { createStore } from 'vuex'
import { cloneDeep } from 'lodash'
import instanceModule from 'src/modules/instance.js'
import statusesModule from 'src/modules/statuses.js'
import notificationsModule from 'src/modules/notifications.js'
import usersModule from 'src/modules/users.js'
import apiModule from 'src/modules/api.js'
import configModule from 'src/modules/config.js'
import profileConfigModule from 'src/modules/profileConfig.js'
import serverSideStorageModule from 'src/modules/serverSideStorage.js'
import adminSettingsModule from 'src/modules/adminSettings.js'
import oauthModule from 'src/modules/oauth.js'
import authFlowModule from 'src/modules/auth_flow.js'
import oauthTokensModule from 'src/modules/oauth_tokens.js'
import draftsModule from 'src/modules/drafts.js'
import chatsModule from 'src/modules/chats.js'
import bookmarkFoldersModule from 'src/modules/bookmark_folders.js'

const tweakModules = modules => {
  const res = {}
  Object.entries(modules).forEach(([name, module]) => {
    const m = { ...module }
    m.state = cloneDeep(module.state)
    res[name] = m
  })
  return res
}

const makeMockStore = () => {
  return createStore({
    modules: tweakModules({
      instance: instanceModule,
      // TODO refactor users/statuses modules, they depend on each other
      users: usersModule,
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
    }),
  })
}

export default makeMockStore
