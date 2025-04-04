import {
  rgb2hex,
  hex2rgb,
  getContrastRatioLayers,
  relativeLuminance
} from 'src/services/color_convert/color_convert.js'
import {
  newImporter,
  newExporter
} from 'src/services/export_import/export_import.js'
import {
  SLOT_INHERITANCE
} from 'src/services/theme_data/pleromafe.js'
import {
  CURRENT_VERSION,
  OPACITIES,
  getLayers,
  getOpacitySlot,
  DEFAULT_SHADOWS,
  generateColors,
  generateShadows,
  generateRadii,
  generateFonts,
  shadows2to3,
  colors2to3
} from 'src/services/theme_data/theme_data.service.js'

import { convertTheme2To3 } from 'src/services/theme_data/theme2_to_theme3.js'
import { init } from 'src/services/theme_data/theme_data_3.service.js'
import {
  getCssRules,
  getScopedVersion
} from 'src/services/theme_data/css_utils.js'

import ColorInput from 'src/components/color_input/color_input.vue'
import RangeInput from 'src/components/range_input/range_input.vue'
import OpacityInput from 'src/components/opacity_input/opacity_input.vue'
import ShadowControl from 'src/components/shadow_control/shadow_control.vue'
import FontControl from 'src/components/font_control/font_control.vue'
import ContrastRatio from 'src/components/contrast_ratio/contrast_ratio.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Select from 'src/components/select/select.vue'

import Preview from './theme_preview.vue'
import { useInterfaceStore } from 'src/stores/interface'

// List of color values used in v1
const v1OnlyNames = [
  'bg',
  'fg',
  'text',
  'link',
  'cRed',
  'cGreen',
  'cBlue',
  'cOrange'
].map(_ => _ + 'ColorLocal')

const colorConvert = (color) => {
  if (color.startsWith('--') || color === 'transparent') {
    return color
  } else {
    return hex2rgb(color)
  }
}

export default {
  data () {
    return {
      themeV3Preview: [],
      themeImporter: newImporter({
        validator: this.importValidator,
        onImport: this.onImport,
        onImportFailure: this.onImportFailure
      }),
      themeExporter: newExporter({
        filename: 'pleroma_theme',
        getExportedObject: () => this.exportedTheme
      }),
      availableStyles: [],
      selected: '',
      selectedTheme: this.$store.getters.mergedConfig.theme,
      themeWarning: undefined,
      tempImportFile: undefined,
      engineVersion: 0,

      previewTheme: {},

      shadowsInvalid: true,
      colorsInvalid: true,
      radiiInvalid: true,

      keepColor: false,
      keepShadows: false,
      keepOpacity: false,
      keepRoundness: false,
      keepFonts: false,

      ...Object.keys(SLOT_INHERITANCE)
        .map(key => [key, ''])
        .reduce((acc, [key, val]) => ({ ...acc, [key + 'ColorLocal']: val }), {}),

      ...Object.keys(OPACITIES)
        .map(key => [key, ''])
        .reduce((acc, [key, val]) => ({ ...acc, [key + 'OpacityLocal']: val }), {}),

      shadowSelected: undefined,
      shadowsLocal: {},
      fontsLocal: {},

      btnRadiusLocal: '',
      inputRadiusLocal: '',
      checkboxRadiusLocal: '',
      panelRadiusLocal: '',
      avatarRadiusLocal: '',
      avatarAltRadiusLocal: '',
      attachmentRadiusLocal: '',
      tooltipRadiusLocal: '',
      chatMessageRadiusLocal: ''
    }
  },
  created () {
    const currentIndex = this.$store.state.instance.themesIndex

    let promise
    if (currentIndex) {
      promise = Promise.resolve(currentIndex)
    } else {
      promise = useInterfaceStore().fetchThemesIndex()
    }

    promise.then(themesIndex => {
      Object
        .values(themesIndex)
        .forEach(themeFunc => {
          themeFunc().then(themeData => themeData && this.availableStyles.push(themeData))
        })
    })
  },
  mounted () {
    if (typeof this.shadowSelected === 'undefined') {
      this.shadowSelected = this.shadowsAvailable[0]
    }
  },
  computed: {
    themeWarningHelp () {
      if (!this.themeWarning) return
      const t = this.$t
      const pre = 'settings.style.switcher.help.'
      const {
        origin,
        themeEngineVersion,
        type,
        noActionsPossible
      } = this.themeWarning
      if (origin === 'file') {
        // Loaded v2 theme from file
        if (themeEngineVersion === 2 && type === 'wrong_version') {
          return t(pre + 'v2_imported')
        }
        if (themeEngineVersion > CURRENT_VERSION) {
          return t(pre + 'future_version_imported') + ' ' +
            (
              noActionsPossible
                ? t(pre + 'snapshot_missing')
                : t(pre + 'snapshot_present')
            )
        }
        if (themeEngineVersion < CURRENT_VERSION) {
          return t(pre + 'future_version_imported') + ' ' +
            (
              noActionsPossible
                ? t(pre + 'snapshot_missing')
                : t(pre + 'snapshot_present')
            )
        }
      } else if (origin === 'localStorage') {
        if (type === 'snapshot_source_mismatch') {
          return t(pre + 'snapshot_source_mismatch')
        }
        // FE upgraded from v2
        if (themeEngineVersion === 2) {
          return t(pre + 'upgraded_from_v2')
        }
        // Admin downgraded FE
        if (themeEngineVersion > CURRENT_VERSION) {
          return t(pre + 'fe_downgraded') + ' ' +
            (
              noActionsPossible
                ? t(pre + 'migration_snapshot_ok')
                : t(pre + 'migration_snapshot_gone')
            )
        }
        // Admin upgraded FE
        if (themeEngineVersion < CURRENT_VERSION) {
          return t(pre + 'fe_upgraded') + ' ' +
            (
              noActionsPossible
                ? t(pre + 'migration_snapshot_ok')
                : t(pre + 'migration_snapshot_gone')
            )
        }
      }
    },
    selectedVersion () {
      return Array.isArray(this.selectedTheme) ? 1 : 2
    },
    currentColors () {
      return Object.keys(SLOT_INHERITANCE)
        .map(key => [key, this[key + 'ColorLocal']])
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})
    },
    currentOpacity () {
      return Object.keys(OPACITIES)
        .map(key => [key, this[key + 'OpacityLocal']])
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})
    },
    currentRadii () {
      return {
        btn: this.btnRadiusLocal,
        input: this.inputRadiusLocal,
        checkbox: this.checkboxRadiusLocal,
        panel: this.panelRadiusLocal,
        avatar: this.avatarRadiusLocal,
        avatarAlt: this.avatarAltRadiusLocal,
        tooltip: this.tooltipRadiusLocal,
        attachment: this.attachmentRadiusLocal,
        chatMessage: this.chatMessageRadiusLocal
      }
    },
    // This needs optimization maybe
    previewContrast () {
      try {
        if (!this.previewTheme.colors.bg) return {}
        const colors = this.previewTheme.colors
        const opacity = this.previewTheme.opacity
        if (!colors.bg) return {}
        const hints = (ratio) => ({
          text: ratio.toPrecision(3) + ':1',
          // AA level, AAA level
          aa: ratio >= 4.5,
          aaa: ratio >= 7,
          // same but for 18pt+ texts
          laa: ratio >= 3,
          laaa: ratio >= 4.5
        })
        const colorsConverted = Object.entries(colors).reduce((acc, [key, value]) => ({ ...acc, [key]: colorConvert(value) }), {})

        const ratios = Object.entries(SLOT_INHERITANCE).reduce((acc, [key, value]) => {
          const slotIsBaseText = key === 'text' || key === 'link'
          const slotIsText = slotIsBaseText || (
            typeof value === 'object' && value !== null && value.textColor
          )
          if (!slotIsText) return acc
          const { layer, variant } = slotIsBaseText ? { layer: 'bg' } : value
          const background = variant || layer
          const opacitySlot = getOpacitySlot(background)
          const textColors = [
            key,
            ...(background === 'bg' ? ['cRed', 'cGreen', 'cBlue', 'cOrange'] : [])
          ]

          const layers = getLayers(
            layer,
            variant || layer,
            opacitySlot,
            colorsConverted,
            opacity
          )

          // Temporary patch for null-y value errors
          if (layers.flat().some(v => v == null)) return acc

          return {
            ...acc,
            ...textColors.reduce((acc, textColorKey) => {
              const newKey = slotIsBaseText
                ? 'bg' + textColorKey[0].toUpperCase() + textColorKey.slice(1)
                : textColorKey
              return {
                ...acc,
                [newKey]: getContrastRatioLayers(
                  colorsConverted[textColorKey],
                  layers,
                  colorsConverted[textColorKey]
                )
              }
            }, {})
          }
        }, {})

        return Object.entries(ratios).reduce((acc, [k, v]) => { acc[k] = hints(v); return acc }, {})
      } catch (e) {
        console.warn('Failure computing contrasts', e)
        return {}
      }
    },
    themeDataUsed () {
      return useInterfaceStore().themeDataUsed
    },
    shadowsAvailable () {
      return Object.keys(DEFAULT_SHADOWS).sort()
    },
    currentShadowOverriden: {
      get () {
        return !!this.currentShadow
      },
      set (val) {
        if (val) {
          this.shadowsLocal[this.shadowSelected] = (this.currentShadowFallback || [])
            .map(s => ({
              name: null,
              x: 0,
              y: 0,
              blur: 0,
              spread: 0,
              inset: false,
              color: '#000000',
              alpha: 1,
              ...s
            }))
        } else {
          delete this.shadowsLocal[this.shadowSelected]
        }
      }
    },
    currentShadowFallback () {
      return (this.previewTheme.shadows || {})[this.shadowSelected]
    },
    currentShadow: {
      get () {
        return this.shadowsLocal[this.shadowSelected]
      },
      set (v) {
        this.shadowsLocal[this.shadowSelected] = v
      }
    },
    themeValid () {
      return !this.shadowsInvalid && !this.colorsInvalid && !this.radiiInvalid
    },
    exportedTheme () {
      const saveEverything = (
        !this.keepFonts &&
        !this.keepShadows &&
        !this.keepOpacity &&
        !this.keepRoundness &&
        !this.keepColor
      )

      const source = {
        themeEngineVersion: CURRENT_VERSION
      }

      if (this.keepFonts || saveEverything) {
        source.fonts = this.fontsLocal
      }
      if (this.keepShadows || saveEverything) {
        source.shadows = this.shadowsLocal
      }
      if (this.keepOpacity || saveEverything) {
        source.opacity = this.currentOpacity
      }
      if (this.keepColor || saveEverything) {
        source.colors = this.currentColors
      }
      if (this.keepRoundness || saveEverything) {
        source.radii = this.currentRadii
      }

      const theme = {
        themeEngineVersion: CURRENT_VERSION,
        ...this.previewTheme
      }

      return {
        // To separate from other random JSON files and possible future source formats
        _pleroma_theme_version: 2, theme, source
      }
    },
    isActive () {
      const tabSwitcher = this.$parent
      return tabSwitcher ? tabSwitcher.isActive('theme') : false
    }
  },
  components: {
    ColorInput,
    OpacityInput,
    RangeInput,
    ContrastRatio,
    ShadowControl,
    FontControl,
    TabSwitcher,
    Preview,
    Checkbox,
    Select
  },
  methods: {
    loadTheme (
      {
        theme,
        source,
        _pleroma_theme_version: fileVersion
      },
      origin,
      forceUseSource = false
    ) {
      this.dismissWarning()
      const version = (origin === 'localStorage' && !theme.colors)
        ? 'l1'
        : fileVersion
      const snapshotEngineVersion = (theme || {}).themeEngineVersion
      const themeEngineVersion = (source || {}).themeEngineVersion || 2
      const versionsMatch = themeEngineVersion === CURRENT_VERSION
      const sourceSnapshotMismatch = (
        theme !== undefined &&
          source !== undefined &&
          themeEngineVersion !== snapshotEngineVersion
      )
      // Force loading of source if user requested it or if snapshot
      // is unavailable
      const forcedSourceLoad = (source && forceUseSource) || !theme
      if (!(versionsMatch && !sourceSnapshotMismatch) &&
          !forcedSourceLoad &&
          version !== 'l1' &&
          origin !== 'defaults'
      ) {
        if (sourceSnapshotMismatch && origin === 'localStorage') {
          this.themeWarning = {
            origin,
            themeEngineVersion,
            type: 'snapshot_source_mismatch'
          }
        } else if (!theme) {
          this.themeWarning = {
            origin,
            noActionsPossible: true,
            themeEngineVersion,
            type: 'no_snapshot_old_version'
          }
        } else if (!versionsMatch) {
          this.themeWarning = {
            origin,
            noActionsPossible: !source,
            themeEngineVersion,
            type: 'wrong_version'
          }
        }
      }
      this.normalizeLocalState(theme, version, source, forcedSourceLoad)
    },
    forceLoadLocalStorage () {
      this.loadThemeFromLocalStorage(true)
    },
    dismissWarning () {
      this.themeWarning = undefined
      this.tempImportFile = undefined
    },
    forceLoad () {
      const { origin } = this.themeWarning
      switch (origin) {
        case 'localStorage':
          this.loadThemeFromLocalStorage(true)
          break
        case 'file':
          this.onImport(this.tempImportFile, true)
          break
      }
      this.dismissWarning()
    },
    forceSnapshot () {
      const { origin } = this.themeWarning
      switch (origin) {
        case 'localStorage':
          this.loadThemeFromLocalStorage(false, true)
          break
        case 'file':
          console.error('Forcing snapshot from file is not supported yet')
          break
      }
      this.dismissWarning()
    },
    loadThemeFromLocalStorage (confirmLoadSource = false) {
      const theme = this.themeDataUsed?.source
      if (theme) {
        this.loadTheme(
          {
            theme
          },
          'localStorage',
          confirmLoadSource
        )
      }
    },
    setCustomTheme () {
      useInterfaceStore().setThemeV2({
        customTheme: {
          ignore: true,
          themeFileVersion: this.selectedVersion,
          themeEngineVersion: CURRENT_VERSION,
          ...this.previewTheme
        },
        customThemeSource: {
          themeFileVersion: this.selectedVersion,
          themeEngineVersion: CURRENT_VERSION,
          shadows: this.shadowsLocal,
          fonts: this.fontsLocal,
          opacity: this.currentOpacity,
          colors: this.currentColors,
          radii: this.currentRadii
        }
      })
    },
    updatePreviewColors () {
      const result = generateColors({
        opacity: this.currentOpacity,
        colors: this.currentColors
      })
      this.previewTheme.colors = result.theme.colors
      this.previewTheme.opacity = result.theme.opacity
    },
    updatePreviewShadows () {
      this.previewTheme.shadows = generateShadows(
        {
          shadows: this.shadowsLocal,
          opacity: this.previewTheme.opacity,
          themeEngineVersion: this.engineVersion
        },
        this.previewTheme.colors,
        relativeLuminance(this.previewTheme.colors.bg) < 0.5 ? 1 : -1
      ).theme.shadows
    },
    importTheme () { this.themeImporter.importData() },
    exportTheme () { this.themeExporter.exportData() },
    onImport (parsed, forceSource = false) {
      this.tempImportFile = parsed
      this.loadTheme(parsed, 'file', forceSource)
    },
    onImportFailure () {
      useInterfaceStore().pushGlobalNotice({ messageKey: 'settings.invalid_theme_imported', level: 'error' })
    },
    importValidator (parsed) {
      const version = parsed._pleroma_theme_version
      return version >= 1 || version <= 2
    },
    clearAll () {
      this.loadThemeFromLocalStorage()
    },

    // Clears all the extra stuff when loading V1 theme
    clearV1 () {
      Object.keys(this.$data)
        .filter(_ => _.endsWith('ColorLocal') || _.endsWith('OpacityLocal'))
        .filter(_ => !v1OnlyNames.includes(_))
        .forEach(key => {
          this.$data[key] = undefined
        })
    },

    clearRoundness () {
      Object.keys(this.$data)
        .filter(_ => _.endsWith('RadiusLocal'))
        .forEach(key => {
          this.$data[key] = undefined
        })
    },

    clearOpacity () {
      Object.keys(this.$data)
        .filter(_ => _.endsWith('OpacityLocal'))
        .forEach(key => {
          this.$data[key] = undefined
        })
    },

    clearShadows () {
      this.shadowsLocal = {}
    },

    clearFonts () {
      this.fontsLocal = {}
    },

    /**
     * This applies stored theme data onto form. Supports three versions of data:
     * v3 (version >= 3) - newest version of themes which supports snapshots for better compatiblity
     * v2 (version = 2) - newer version of themes.
     * v1 (version = 1) - older version of themes (import from file)
     * v1l (version = l1) - older version of theme (load from local storage)
     * v1 and v1l differ because of way themes were stored/exported.
     * @param {Object} theme - theme data (snapshot)
     * @param {Number} version - version of data. 0 means try to guess based on data. "l1" means v1, locastorage type
     * @param {Object} source - theme source - this will be used if compatible
     * @param {Boolean} source - by default source won't be used if version doesn't match since it might render differently
     *                           this allows importing source anyway
     */
    normalizeLocalState (theme, version = 0, source, forceSource = false) {
      let input
      if (typeof source !== 'undefined') {
        if (forceSource || source?.themeEngineVersion === CURRENT_VERSION) {
          input = source
          version = source.themeEngineVersion
        } else {
          input = theme
        }
      } else {
        input = theme
      }

      const radii = input.radii || input
      const opacity = input.opacity
      const shadows = input.shadows || {}
      const fonts = input.fonts || {}
      const colors = !input.themeEngineVersion
        ? colors2to3(input.colors || input)
        : input.colors || input

      if (version === 0) {
        if (input.version) version = input.version
        // Old v1 naming: fg is text, btn is foreground
        if (typeof colors.text === 'undefined' && typeof colors.fg !== 'undefined') {
          version = 1
        }
        // New v2 naming: text is text, fg is foreground
        if (typeof colors.text !== 'undefined' && typeof colors.fg !== 'undefined') {
          version = 2
        }
      }

      this.engineVersion = version

      // Stuff that differs between V1 and V2
      if (version === 1) {
        this.fgColorLocal = rgb2hex(colors.btn)
        this.textColorLocal = rgb2hex(colors.fg)
      }

      if (!this.keepColor) {
        this.clearV1()
        const keys = new Set(version !== 1 ? Object.keys(SLOT_INHERITANCE) : [])
        if (version === 1 || version === 'l1') {
          keys
            .add('bg')
            .add('link')
            .add('cRed')
            .add('cBlue')
            .add('cGreen')
            .add('cOrange')
        }

        keys.forEach(key => {
          const color = colors[key]
          const hex = rgb2hex(colors[key])
          this[key + 'ColorLocal'] = hex === '#aN' ? color : hex
        })
      }

      if (opacity && !this.keepOpacity) {
        this.clearOpacity()
        Object.entries(opacity).forEach(([k, v]) => {
          if (typeof v === 'undefined' || v === null || Number.isNaN(v)) return
          this[k + 'OpacityLocal'] = v
        })
      }

      if (!this.keepRoundness) {
        this.clearRoundness()
        Object.entries(radii).forEach(([k, v]) => {
          // 'Radius' is kept mostly for v1->v2 localstorage transition
          const key = k.endsWith('Radius') ? k.split('Radius')[0] : k
          this[key + 'RadiusLocal'] = v
        })
      }

      if (!this.keepShadows) {
        this.clearShadows()
        if (version === 2) {
          this.shadowsLocal = shadows2to3(shadows, this.previewTheme.opacity)
        } else {
          this.shadowsLocal = shadows
        }
        this.updatePreviewColors()
        this.updatePreviewShadows()
        this.shadowSelected = this.shadowsAvailable[0]
      }

      if (!this.keepFonts) {
        this.clearFonts()
        this.fontsLocal = fonts
      }
    },
    updateTheme3Preview () {
      const theme2 = convertTheme2To3(this.previewTheme)
      const theme3 = init({
        inputRuleset: theme2,
        ultimateBackgroundColor: '#000000',
        liteMode: true
      })

      this.themeV3Preview = getScopedVersion(
        getCssRules(theme3.eager),
        '#theme-preview'
      ).join('\n')
    }
  },
  watch: {
    themeDataUsed () {
      this.loadThemeFromLocalStorage()
    },
    currentRadii () {
      try {
        this.previewTheme.radii = generateRadii({ radii: this.currentRadii }).theme.radii
        this.radiiInvalid = false
      } catch (e) {
        this.radiiInvalid = true
        console.warn(e)
      }
    },
    shadowsLocal: {
      handler () {
        try {
          this.updatePreviewShadows()
          this.shadowsInvalid = false
        } catch (e) {
          this.shadowsInvalid = true
          console.warn(e)
        }
      },
      deep: true
    },
    fontsLocal: {
      handler () {
        try {
          this.previewTheme.fonts = generateFonts({ fonts: this.fontsLocal }).theme.fonts
          this.fontsInvalid = false
        } catch (e) {
          this.fontsInvalid = true
          console.warn(e)
        }
      },
      deep: true
    },
    currentColors () {
      try {
        this.updatePreviewColors()
        this.colorsInvalid = false
      } catch (e) {
        this.colorsInvalid = true
        console.warn(e)
      }
    },
    currentOpacity () {
      try {
        this.updatePreviewColors()
      } catch (e) {
        console.warn(e)
      }
    },
    selected () {
      this.selectedTheme = Object.entries(this.availableStyles).find(([, s]) => {
        if (Array.isArray(s)) {
          return s[0] === this.selected
        } else {
          return s.name === this.selected
        }
      })[1]
    },
    selectedTheme () {
      this.dismissWarning()
      if (this.selectedVersion === 1) {
        if (!this.keepRoundness) {
          this.clearRoundness()
        }

        if (!this.keepShadows) {
          this.clearShadows()
        }

        if (!this.keepOpacity) {
          this.clearOpacity()
        }

        if (!this.keepColor) {
          this.clearV1()

          this.bgColorLocal = this.selectedTheme[1]
          this.fgColorLocal = this.selectedTheme[2]
          this.textColorLocal = this.selectedTheme[3]
          this.linkColorLocal = this.selectedTheme[4]
          this.cRedColorLocal = this.selectedTheme[5]
          this.cGreenColorLocal = this.selectedTheme[6]
          this.cBlueColorLocal = this.selectedTheme[7]
          this.cOrangeColorLocal = this.selectedTheme[8]
        }
      } else if (this.selectedVersion >= 2) {
        this.normalizeLocalState(this.selectedTheme.theme, 2, this.selectedTheme.source)
      }
    }
  }
}
