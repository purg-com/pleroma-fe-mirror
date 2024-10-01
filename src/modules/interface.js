import { getResourcesIndex, applyTheme, tryLoadCache } from '../services/style_setter/style_setter.js'
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
      // Set is used here so that we filter out duplicate fonts (possibly same font but with different weight)
      state.localFonts = [...(new Set(value.map(font => font.family))).values()]
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
    async fetchPalettesIndex ({ commit, state }) {
      try {
        const value = await getResourcesIndex('/static/palettes/index.json')
        commit('setInstanceOption', { name: 'palettesIndex', value })
        return value
      } catch (e) {
        console.error('Could not fetch palettes index', e)
        return {}
      }
    },
    setPalette ({ dispatch, commit }, value) {
      dispatch('resetV3')
      dispatch('resetV2')

      commit('setOption', { name: 'palette', value })

      dispatch('applyTheme')
    },
    setPaletteCustom ({ dispatch, commit }, value) {
      dispatch('resetV3')
      dispatch('resetV2')

      commit('setOption', { name: 'paletteCustomData', value })

      dispatch('applyTheme')
    },
    async fetchStylesIndex ({ commit, state }) {
      try {
        const value = await getResourcesIndex('/static/styles/index.json')
        commit('setInstanceOption', { name: 'stylesIndex', value })
        return value
      } catch (e) {
        console.error('Could not fetch styles index', e)
        return Promise.resolve({})
      }
    },
    setStyle ({ dispatch, commit }, value) {
      dispatch('resetV3')
      dispatch('resetV2')

      commit('setOption', { name: 'style', value })

      dispatch('applyTheme')
    },
    setStyleCustom ({ dispatch, commit }, value) {
      dispatch('resetV3')
      dispatch('resetV2')

      commit('setOption', { name: 'styleCustomData', value })

      dispatch('applyTheme')
    },
    async fetchThemesIndex ({ commit, state }) {
      try {
        const value = await getResourcesIndex('/static/styles.json')
        commit('setInstanceOption', { name: 'themesIndex', value })
        return value
      } catch (e) {
        console.error('Could not fetch themes index', e)
        return Promise.resolve({})
      }
    },
    setTheme ({ dispatch, commit }, value) {
      dispatch('resetV3')
      dispatch('resetV2')

      commit('setOption', { name: 'theme', value })

      dispatch('applyTheme')
    },
    setThemeCustom ({ dispatch, commit }, value) {
      dispatch('resetV3')
      dispatch('resetV2')

      commit('setOption', { name: 'customTheme', value })
      commit('setOption', { name: 'customThemeSource', value })

      dispatch('applyTheme')
    },
    resetV3 ({ dispatch, commit }) {
      commit('setOption', { name: 'style', value: null })
      commit('setOption', { name: 'styleCustomData', value: null })
      commit('setOption', { name: 'palette', value: null })
      commit('setOption', { name: 'paletteCustomData', value: null })
    },
    resetV2 ({ dispatch, commit }) {
      commit('setOption', { name: 'theme', value: null })
      commit('setOption', { name: 'customTheme', value: null })
      commit('setOption', { name: 'customThemeSource', value: null })
    },
    async applyTheme (
      { dispatch, commit, rootState },
      { recompile = true } = {}
    ) {
      // If we're not not forced to recompile try using
      // cache (tryLoadCache return true if load successful)

      const {
        style: instanceStyleName,
        palette: instancePaletteName
      } = rootState.instance
      let {
        theme: instanceThemeV2Name,
        themesIndex,
        stylesIndex,
        palettesIndex
      } = rootState.instance

      const {
        style: userStyleName,
        styleCustomData: userStyleCustomData,
        palette: userPaletteName,
        paletteCustomData: userPaletteCustomData,
        forceThemeRecompilation,
        themeDebug,
        theme3hacks
      } = rootState.config
      let {
        theme: userThemeV2Name,
        customTheme: userThemeV2Snapshot,
        customThemeSource: userThemeV2Source

      } = rootState.config

      const forceRecompile = forceThemeRecompilation || recompile
      if (!forceRecompile && !themeDebug && tryLoadCache()) {
        return commit('setThemeApplied')
      }

      let majorVersionUsed

      if (userPaletteName || userPaletteCustomData ||
          userStyleName || userStyleCustomData ||
          instancePaletteName ||
          instanceStyleName
      ) {
        // Palette and/or style overrides V2 themes
        instanceThemeV2Name = null
        userThemeV2Name = null
        userThemeV2Source = null
        userThemeV2Snapshot = null

        majorVersionUsed = 'v3'
        if (!palettesIndex || !stylesIndex) {
          const result = await Promise.all([
            dispatch('fetchPalettesIndex'),
            dispatch('fetchStylesIndex')
          ])

          palettesIndex = result[0]
          stylesIndex = result[1]
        }
      } else {
        majorVersionUsed = 'v2'
        // Promise.all just to be uniform with v3
        const result = await Promise.all([
          dispatch('fetchThemesIndex')
        ])
        themesIndex = result[0]
      }

      let styleDataUsed = null
      let styleNameUsed = null
      let paletteDataUsed = null
      let paletteNameUsed = null
      let themeNameUsed = null
      let themeDataUsed = null

      if (majorVersionUsed === 'v3') {
        if (userStyleCustomData) {
          styleNameUsed = 'custom' // custom data overrides name
          styleDataUsed = userStyleCustomData
        } else {
          styleNameUsed = userStyleName || instanceStyleName
          let styleFetchFunc = stylesIndex[themeNameUsed]
          if (!styleFetchFunc) {
            const newName = Object.keys(stylesIndex)[0]
            styleFetchFunc = stylesIndex[newName]
            console.warn(`Style with id '${styleNameUsed}' not found, falling back to '${newName}'`)
          }
          styleDataUsed = await styleFetchFunc?.()
        }

        if (userPaletteCustomData) {
          paletteNameUsed = 'custom' // custom data overrides name
          paletteDataUsed = userPaletteCustomData
        } else {
          paletteNameUsed = userPaletteName || instanceStyleName
          let paletteFetchFunc = palettesIndex[themeNameUsed]
          if (!paletteFetchFunc) {
            const newName = Object.keys(palettesIndex)[0]
            paletteFetchFunc = palettesIndex[newName]
            console.warn(`Palette with id '${paletteNameUsed}' not found, falling back to '${newName}'`)
          }
          paletteDataUsed = await paletteFetchFunc?.()
        }
      } else {
        if (userThemeV2Snapshot || userThemeV2Source) {
          themeNameUsed = 'custom' // custom data overrides name
          themeDataUsed = userThemeV2Snapshot || userThemeV2Source
        } else {
          themeNameUsed = userThemeV2Name || instanceThemeV2Name
          let themeFetchFunc = themesIndex[themeNameUsed]
          if (!themeFetchFunc) {
            const newName = Object.keys(themesIndex)[0]
            themeFetchFunc = themesIndex[newName]
            console.warn(`Theme with id '${themeNameUsed}' not found, falling back to '${newName}'`)
          }
          themeDataUsed = await themeFetchFunc?.()
        }
        // Themes v2 editor support
        commit('setInstanceOption', { name: 'themeData', value: themeDataUsed })
      }

      const paletteIss = (() => {
        if (!paletteDataUsed) return null
        const result = {
          component: 'Root',
          directives: {}
        }

        Object
          .entries(paletteDataUsed)
          .filter(([k]) => k !== 'name')
          .forEach(([k, v]) => {
            let issRootDirectiveName
            switch (k) {
              case 'background':
                issRootDirectiveName = 'bg'
                break
              case 'foreground':
                issRootDirectiveName = 'fg'
                break
              default:
                issRootDirectiveName = k
            }
            result.directives['--' + issRootDirectiveName] = 'color | ' + v
          })
        return result
      })()

      const theme2ruleset = themeDataUsed && convertTheme2To3(normalizeThemeData(themeDataUsed))
      const hacks = []

      Object.entries(theme3hacks).forEach(([key, value]) => {
        switch (key) {
          case 'fonts': {
            Object.entries(theme3hacks.fonts).forEach(([fontKey, font]) => {
              if (!font?.family) return
              switch (fontKey) {
                case 'interface':
                  hacks.push({
                    component: 'Root',
                    directives: {
                      '--font': 'generic | ' + font.family
                    }
                  })
                  break
                case 'input':
                  hacks.push({
                    component: 'Input',
                    directives: {
                      '--font': 'generic | ' + font.family
                    }
                  })
                  break
                case 'post':
                  hacks.push({
                    component: 'RichContent',
                    directives: {
                      '--font': 'generic | ' + font.family
                    }
                  })
                  break
                case 'monospace':
                  hacks.push({
                    component: 'Root',
                    directives: {
                      '--monoFont': 'generic | ' + font.family
                    }
                  })
                  break
              }
            })
            break
          }
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
              hacks.push(newRule)
            }
            break
          }
        }
      })

      const rulesetArray = [
        theme2ruleset,
        styleDataUsed,
        paletteIss,
        hacks
      ].filter(x => x)

      return applyTheme(
        rulesetArray.flat(),
        () => commit('setThemeApplied'),
        themeDebug
      )
    }
  }
}

export default interfaceMod

export const normalizeThemeData = (input) => {
  if (Array.isArray(input)) {
    const themeData = { colors: {} }
    themeData.colors.bg = input[1]
    themeData.colors.fg = input[2]
    themeData.colors.text = input[3]
    themeData.colors.link = input[4]
    themeData.colors.cRed = input[5]
    themeData.colors.cGreen = input[6]
    themeData.colors.cBlue = input[7]
    themeData.colors.cOrange = input[8]
    return generatePreset(themeData).source || generatePreset(themeData).theme
  }

  let themeData, themeSource

  if (input.themeFileVerison === 1) {
    // this might not be even used at all, some leftover of unimplemented code in V2 editor
    return generatePreset(input).theme
  } else if (
    Object.prototype.hasOwnProperty.call(input, '_pleroma_theme_version') ||
      Object.prototype.hasOwnProperty.call(input, 'source') ||
      Object.prototype.hasOwnProperty.call(input, 'theme')
  ) {
    // We got passed a full theme file
    themeData = input.theme
    themeSource = input.source
  } else if (Object.prototype.hasOwnProperty.call(input, 'themeEngineVersion')) {
    // We got passed a source/snapshot
    themeData = input
    themeSource = input
  }
  // New theme presets don't have 'theme' property, they use 'source'

  let out // shout, shout let it all out
  if (themeSource && themeSource.themeEngineVersion === CURRENT_VERSION) {
    // There are some themes in wild that have completely broken source
    out = { ...(themeData || {}), ...themeSource }
  } else {
    out = themeData
  }

  // generatePreset here basically creates/updates "snapshot",
  // while also fixing the 2.2 -> 2.3 colors/shadows/etc
  return generatePreset(out).theme
}
