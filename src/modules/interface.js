import { getPreset, applyTheme, tryLoadCache } from '../services/style_setter/style_setter.js'
import { CURRENT_VERSION, generatePreset } from 'src/services/theme_data/theme_data.service.js'
import { convertTheme2To3 } from 'src/services/theme_data/theme2_to_theme3.js'

const defaultState = {
  localFonts: null,
  themeApplied: false,
  temporaryChangesTimeoutId: null, // used for temporary options that revert after a timeout
  temporaryChangesConfirm: () => {}, // used for applying temporary options
  temporaryChangesRevert: () => {}, // used for reverting temporary options
  settingsModalState: 'hidden',
  settingsModalLoadedUser: false,
  settingsModalLoadedAdmin: false,
  settingsModalTargetTab: null,
  settingsModalMode: 'user',
  settings: {
    currentSaveStateNotice: null,
    noticeClearTimeout: null,
    notificationPermission: null
  },
  browserSupport: {
    cssFilter: window.CSS && window.CSS.supports && (
      window.CSS.supports('filter', 'drop-shadow(0 0)') ||
      window.CSS.supports('-webkit-filter', 'drop-shadow(0 0)')
    ),
    localFonts: typeof window.queryLocalFonts === 'function'
  },
  layoutType: 'normal',
  globalNotices: [],
  layoutHeight: 0,
  lastTimeline: null
}

const interfaceMod = {
  state: defaultState,
  mutations: {
    settingsSaved (state, { success, error }) {
      if (success) {
        if (state.noticeClearTimeout) {
          clearTimeout(state.noticeClearTimeout)
        }
        state.settings.currentSaveStateNotice = { error: false, data: success }
        state.settings.noticeClearTimeout = setTimeout(() => delete state.settings.currentSaveStateNotice, 2000)
      } else {
        state.settings.currentSaveStateNotice = { error: true, errorData: error }
      }
    },
    setTemporaryChanges (state, { timeoutId, confirm, revert }) {
      state.temporaryChangesTimeoutId = timeoutId
      state.temporaryChangesConfirm = confirm
      state.temporaryChangesRevert = revert
    },
    clearTemporaryChanges (state) {
      clearTimeout(state.temporaryChangesTimeoutId)
      state.temporaryChangesTimeoutId = null
      state.temporaryChangesConfirm = () => {}
      state.temporaryChangesRevert = () => {}
    },
    setThemeApplied (state) {
      state.themeApplied = true
    },
    setNotificationPermission (state, permission) {
      state.notificationPermission = permission
    },
    setLayoutType (state, value) {
      state.layoutType = value
    },
    closeSettingsModal (state) {
      state.settingsModalState = 'hidden'
    },
    togglePeekSettingsModal (state) {
      switch (state.settingsModalState) {
        case 'minimized':
          state.settingsModalState = 'visible'
          return
        case 'visible':
          state.settingsModalState = 'minimized'
          return
        default:
          throw new Error('Illegal minimization state of settings modal')
      }
    },
    openSettingsModal (state, value) {
      state.settingsModalMode = value
      state.settingsModalState = 'visible'
      if (value === 'user') {
        if (!state.settingsModalLoadedUser) {
          state.settingsModalLoadedUser = true
        }
      } else if (value === 'admin') {
        if (!state.settingsModalLoadedAdmin) {
          state.settingsModalLoadedAdmin = true
        }
      }
    },
    setSettingsModalTargetTab (state, value) {
      state.settingsModalTargetTab = value
    },
    pushGlobalNotice (state, notice) {
      state.globalNotices.push(notice)
    },
    removeGlobalNotice (state, notice) {
      state.globalNotices = state.globalNotices.filter(n => n !== notice)
    },
    setLayoutHeight (state, value) {
      state.layoutHeight = value
    },
    setLayoutWidth (state, value) {
      state.layoutWidth = value
    },
    setLastTimeline (state, value) {
      state.lastTimeline = value
    },
    setFontsList (state, value) {
      state.localFonts = new Set(value.map(font => font.family))
    }
  },
  actions: {
    setPageTitle ({ rootState }, option = '') {
      document.title = `${option} ${rootState.instance.name}`
    },
    settingsSaved ({ commit, dispatch }, { success, error }) {
      commit('settingsSaved', { success, error })
    },
    setNotificationPermission ({ commit }, permission) {
      commit('setNotificationPermission', permission)
    },
    closeSettingsModal ({ commit }) {
      commit('closeSettingsModal')
    },
    openSettingsModal ({ commit }, value = 'user') {
      commit('openSettingsModal', value)
    },
    togglePeekSettingsModal ({ commit }) {
      commit('togglePeekSettingsModal')
    },
    clearSettingsModalTargetTab ({ commit }) {
      commit('setSettingsModalTargetTab', null)
    },
    openSettingsModalTab ({ commit }, value) {
      commit('setSettingsModalTargetTab', value)
      commit('openSettingsModal', 'user')
    },
    pushGlobalNotice (
      { commit, dispatch, state },
      {
        messageKey,
        messageArgs = {},
        level = 'error',
        timeout = 0
      }) {
      const notice = {
        messageKey,
        messageArgs,
        level
      }
      commit('pushGlobalNotice', notice)
      // Adding a new element to array wraps it in a Proxy, which breaks the comparison
      // TODO: Generate UUID or something instead or relying on !== operator?
      const newNotice = state.globalNotices[state.globalNotices.length - 1]
      if (timeout) {
        setTimeout(() => dispatch('removeGlobalNotice', newNotice), timeout)
      }
      return newNotice
    },
    removeGlobalNotice ({ commit }, notice) {
      commit('removeGlobalNotice', notice)
    },
    setLayoutHeight ({ commit }, value) {
      commit('setLayoutHeight', value)
    },
    // value is optional, assuming it was cached prior
    setLayoutWidth ({ commit, state, rootGetters, rootState }, value) {
      let width = value
      if (value !== undefined) {
        commit('setLayoutWidth', value)
      } else {
        width = state.layoutWidth
      }
      const mobileLayout = width <= 800
      const normalOrMobile = mobileLayout ? 'mobile' : 'normal'
      const { thirdColumnMode } = rootGetters.mergedConfig
      if (thirdColumnMode === 'none' || !rootState.users.currentUser) {
        commit('setLayoutType', normalOrMobile)
      } else {
        const wideLayout = width >= 1300
        commit('setLayoutType', wideLayout ? 'wide' : normalOrMobile)
      }
    },
    queryLocalFonts ({ commit, dispatch, state }) {
      if (state.localFonts !== null) return
      commit('setFontsList', [])
      if (!state.browserSupport.localFonts) {
        return
      }
      window
        .queryLocalFonts()
        .then((fonts) => {
          console.log(fonts)
          commit('setFontsList', fonts)
        })
        .catch((e) => {
          dispatch('pushGlobalNotice', {
            messageKey: 'settings.style.themes3.font.font_list_unavailable',
            messageArgs: {
              error: e
            },
            level: 'error'
          })
        })
    },
    setLastTimeline ({ commit }, value) {
      commit('setLastTimeline', value)
    },
    setTheme ({ commit, rootState }, { themeName, themeData, recompile, saveData } = {}) {
      const {
        theme: instanceThemeName
      } = rootState.instance

      const {
        theme: userThemeName,
        customTheme: userThemeSnapshot,
        customThemeSource: userThemeSource,
        forceThemeRecompilation,
        themeDebug,
        theme3hacks
      } = rootState.config

      const actualThemeName = userThemeName || instanceThemeName

      const forceRecompile = forceThemeRecompilation || recompile

      let promise = null

      if (themeData) {
        promise = Promise.resolve(normalizeThemeData(themeData))
      } else if (themeName) {
        promise = getPreset(themeName).then(themeData => normalizeThemeData(themeData))
      } else if (userThemeSource || userThemeSnapshot) {
        if (userThemeSource && userThemeSource.themeEngineVersion === CURRENT_VERSION) {
          promise = Promise.resolve(normalizeThemeData(userThemeSource))
        } else {
          promise = Promise.resolve(normalizeThemeData(userThemeSnapshot))
        }
      } else if (actualThemeName && actualThemeName !== 'custom') {
        promise = getPreset(actualThemeName).then(themeData => {
          const realThemeData = normalizeThemeData(themeData)
          if (actualThemeName === instanceThemeName) {
            // This sole line is the reason why this whole block is above the recompilation check
            commit('setInstanceOption', { name: 'themeData', value: { theme: realThemeData } })
          }
          return realThemeData
        })
      } else {
        throw new Error('Cannot load any theme!')
      }

      // If we're not not forced to recompile try using
      // cache (tryLoadCache return true if load successful)
      if (!forceRecompile && !themeDebug && tryLoadCache()) {
        commit('setThemeApplied')
        return
      }

      promise
        .then(realThemeData => {
          const theme2ruleset = convertTheme2To3(realThemeData)

          if (saveData) {
            commit('setOption', { name: 'theme', value: themeName || actualThemeName })
            commit('setOption', { name: 'customTheme', value: realThemeData })
            commit('setOption', { name: 'customThemeSource', value: realThemeData })
          }
          const hacks = []

          Object.entries(theme3hacks).forEach(([key, value]) => {
            switch (key) {
              case 'underlay': {
                if (value !== 'none') {
                  const newRule = {
                    component: 'Underlay',
                    directives: {}
                  }
                  if (value === 'opaque') {
                    newRule.directives.opacity = 1
                    newRule.directives.background = '--wallpaper'
                  }
                  if (value === 'transparent') {
                    newRule.directives.opacity = 0
                  }
                  console.log('NEW RULE', newRule)
                  hacks.push(newRule)
                }
                break
              }
            }
          })

          const ruleset = [
            ...theme2ruleset,
            ...hacks
          ]

          applyTheme(
            ruleset,
            () => commit('setThemeApplied'),
            themeDebug
          )
        })

      return promise
    }
  }
}

export default interfaceMod

export const normalizeThemeData = (input) => {
  let themeData = input

  if (Array.isArray(themeData)) {
    themeData = { colors: {} }
    themeData.colors.bg = input[1]
    themeData.colors.fg = input[2]
    themeData.colors.text = input[3]
    themeData.colors.link = input[4]
    themeData.colors.cRed = input[5]
    themeData.colors.cGreen = input[6]
    themeData.colors.cBlue = input[7]
    themeData.colors.cOrange = input[8]
    return generatePreset(themeData).theme
  }

  if (themeData.themeFileVerison === 1) {
    return generatePreset(themeData).theme
  }

  // New theme presets don't have 'theme' property, they use 'source'
  const themeSource = themeData.source

  let out // shout, shout let it all out
  if (!themeData.theme || (themeSource && themeSource.themeEngineVersion === CURRENT_VERSION)) {
    out = themeSource || themeData
  } else {
    out = themeData.theme
  }

  // generatePreset here basically creates/updates "snapshot",
  // while also fixing the 2.2 -> 2.3 colors/shadows/etc
  return generatePreset(out).theme
}
