import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import FloatSetting from '../helpers/float_setting.vue'
import UnitSetting, { defaultHorizontalUnits } from '../helpers/unit_setting.vue'
import PaletteEditor from 'src/components/palette_editor/palette_editor.vue'

import FontControl from 'src/components/font_control/font_control.vue'

import { normalizeThemeData } from 'src/modules/interface'

import { newImporter } from 'src/services/export_import/export_import.js'
import { convertTheme2To3 } from 'src/services/theme_data/theme2_to_theme3.js'
import { init } from 'src/services/theme_data/theme_data_3.service.js'
import {
  getCssRules,
  getScopedVersion
} from 'src/services/theme_data/css_utils.js'

import SharedComputedObject from '../helpers/shared_computed_object.js'
import ProfileSettingIndicator from '../helpers/profile_setting_indicator.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

import Preview from './theme_tab/theme_preview.vue'

library.add(
  faGlobe
)

const AppearanceTab = {
  data () {
    return {
      availableStyles: [],
      bundledPalettes: [],
      fileImporter: newImporter({
        accept: '.json, .piss',
        validator: this.importValidator,
        onImport: this.onImport,
        onImportFailure: this.onImportFailure
      }),
      palettesKeys: [
        'bg',
        'fg',
        'link',
        'text',
        'cRed',
        'cGreen',
        'cBlue',
        'cOrange'
      ],
      userPalette: {},
      intersectionObserver: null,
      thirdColumnModeOptions: ['none', 'notifications', 'postform'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.third_column_mode_${mode}`)
      })),
      forcedRoundnessOptions: ['disabled', 'sharp', 'nonsharp', 'round'].map((mode, i) => ({
        key: mode,
        value: i - 1,
        label: this.$t(`settings.style.themes3.hacks.forced_roundness_mode_${mode}`)
      })),
      underlayOverrideModes: ['none', 'opaque', 'transparent'].map((mode, i) => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.style.themes3.hacks.underlay_override_mode_${mode}`)
      }))
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting,
    FloatSetting,
    UnitSetting,
    ProfileSettingIndicator,
    FontControl,
    Preview,
    PaletteEditor
  },
  mounted () {
    const updateIndex = (resource) => {
      const capitalizedResource = resource[0].toUpperCase() + resource.slice(1)
      const currentIndex = this.$store.state.instance[`${resource}sIndex`]

      let promise
      if (currentIndex) {
        promise = Promise.resolve(currentIndex)
      } else {
        promise = this.$store.dispatch(`fetch${capitalizedResource}sIndex`)
      }

      return promise.then(index => {
        return Object
          .entries(index)
          .map(([k, func]) => [k, func()])
      })
    }

    updateIndex('theme').then(themes => {
      themes.forEach(([key, themePromise]) => themePromise.then(data => {
        this.availableStyles.push({ key, data, name: data.name, version: 'v2' })
      }))
    })

    updateIndex('palette').then(bundledPalettes => {
      bundledPalettes.forEach(([key, palettePromise]) => palettePromise.then(v => {
        let palette
        if (Array.isArray(v)) {
          const [
            name,
            bg,
            fg,
            text,
            link,
            cRed = '#FF0000',
            cGreen = '#00FF00',
            cBlue = '#0000FF',
            cOrange = '#E3FF00'
          ] = v
          palette = { key, name, bg, fg, text, link, cRed, cBlue, cGreen, cOrange }
          this.bundledPalettes.push()
        } else {
          palette = { key, ...v }
        }
        this.bundledPalettes.push(palette)

        if (this.isPaletteActive(key)) {
          this.userPalette = palette
        }
      }))
    })

    if (window.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return
          const theme = this.availableStyles.find(x => x.key === target.dataset.themeKey)
          this.$nextTick(() => {
            if (theme) theme.ready = true
          })
          observer.unobserve(target)
        })
      }, {
        root: this.$refs.themeList
      })
    }
  },
  updated () {
    this.$nextTick(() => {
      this.$refs.themeList.querySelectorAll('.theme-preview').forEach(node => {
        this.intersectionObserver.observe(node)
      })
    })
  },
  computed: {
    availablePalettes () {
      return [
        ...this.bundledPalettes,
        ...this.stylePalettes
      ]
    },
    stylePalettes () {
      if (!this.mergedConfig.styleCustomData) return
      const meta = this.mergedConfig.styleCustomData
        .find(x => x.component === '@meta')
      const result = this.mergedConfig.styleCustomData
        .filter(x => x.component.startsWith('@palette'))
        .map(x => {
          const {
            variant,
            bg,
            fg,
            text,
            link,
            accent,
            cRed,
            cBlue,
            cGreen,
            cOrange,
            wallpaper
          } = x

          const result = {
            name: `${meta.name}: ${variant}`,
            bg,
            fg,
            text,
            link,
            accent,
            cRed,
            cBlue,
            cGreen,
            cOrange,
            wallpaper
          }
          return Object.fromEntries(Object.entries(result).filter(([k, v]) => v))
        })
      return result
    },
    noIntersectionObserver () {
      return !window.IntersectionObserver
    },
    horizontalUnits () {
      return defaultHorizontalUnits
    },
    fontsOverride () {
      return this.$store.getters.mergedConfig.fontsOverride
    },
    columns () {
      const mode = this.$store.getters.mergedConfig.thirdColumnMode

      const notif = mode === 'none' ? [] : ['notifs']

      if (this.$store.getters.mergedConfig.sidebarRight || mode === 'postform') {
        return [...notif, 'content', 'sidebar']
      } else {
        return ['sidebar', 'content', ...notif]
      }
    },
    instanceSpecificPanelPresent () { return this.$store.state.instance.showInstanceSpecificPanel },
    instanceWallpaperUsed () {
      return this.$store.state.instance.background &&
        !this.$store.state.users.currentUser.background_image
    },
    instanceShoutboxPresent () { return this.$store.state.instance.shoutAvailable },
    language: {
      get: function () { return this.$store.getters.mergedConfig.interfaceLanguage },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: val })
      }
    },
    customThemeVersion () {
      const { themeVersion } = this.$store.state.interface
      return themeVersion
    },
    isCustomThemeUsed () {
      const { theme } = this.mergedConfig
      return theme === 'custom'
    },
    isCustomStyleUsed (name) {
      const { style } = this.mergedConfig
      return style === 'custom'
    },
    ...SharedComputedObject()
  },
  methods: {
    updateFont (key, value) {
      this.$store.dispatch('setOption', {
        name: 'theme3hacks',
        value: {
          ...this.mergedConfig.theme3hacks,
          fonts: {
            ...this.mergedConfig.theme3hacks.fonts,
            [key]: value
          }
        }
      })
    },
    importFile () {
      this.fileImporter.importData()
    },
    onImport (parsed, filename) {
      if (filename.endsWith('.json')) {
        this.$store.dispatch('setThemeCustom', parsed.source || parsed.theme)
        this.$store.dispatch('applyTheme')
      }

      // this.loadTheme(parsed, 'file', forceSource)
    },
    onImportFailure (result) {
      this.$store.dispatch('pushGlobalNotice', { messageKey: 'settings.invalid_theme_imported', level: 'error' })
    },
    importValidator (parsed, filename) {
      if (filename.endsWith('.json')) {
        const version = parsed._pleroma_theme_version
        return version >= 1 || version <= 2
      }
    },
    isThemeActive (key) {
      const { theme } = this.mergedConfig
      return key === theme
    },
    isStyleActive (key) {
      const { style } = this.mergedConfig
      return key === style
    },
    isPaletteActive (key) {
      const { palette } = this.mergedConfig
      return key === palette
    },
    setStyle (name) {
      this.$store.dispatch('setTheme', name)
    },
    setTheme (name) {
      this.$store.dispatch('setTheme', name)
    },
    setPalette (name, data) {
      this.$store.dispatch('setPalette', name)
      this.userPalette = data
    },
    setPaletteCustom (data) {
      this.$store.dispatch('setPaletteCustom', data)
      this.userPalette = data
    },
    resetTheming (name) {
      this.$store.dispatch('setStyle', 'stock')
    },
    previewTheme (key, input) {
      let theme3
      if (input) {
        const style = normalizeThemeData(input)
        const theme2 = convertTheme2To3(style)
        theme3 = init({
          inputRuleset: theme2,
          ultimateBackgroundColor: '#000000',
          liteMode: true,
          debug: true,
          onlyNormalState: true
        })
      } else {
        theme3 = init({
          inputRuleset: [],
          ultimateBackgroundColor: '#000000',
          liteMode: true,
          debug: true,
          onlyNormalState: true
        })
      }

      return getScopedVersion(
        getCssRules(theme3.eager),
        '#theme-preview-' + key
      ).join('\n')
    }
  }
}

export default AppearanceTab
