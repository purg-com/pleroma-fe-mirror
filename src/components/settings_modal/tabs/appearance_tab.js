import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import FloatSetting from '../helpers/float_setting.vue'
import UnitSetting, { defaultHorizontalUnits } from '../helpers/unit_setting.vue'

import FontControl from 'src/components/font_control/font_control.vue'

import { normalizeThemeData } from 'src/modules/interface'

import {
  getThemeResources
} from 'src/services/style_setter/style_setter.js'
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
      availablePalettes: [],
      palettesKeys: [
        'background',
        'foreground',
        'link',
        'text',
        'cRed',
        'cBlue',
        'cGreen',
        'cOrange'
      ],
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
    Preview
  },
  mounted () {
    getThemeResources('/static/styles.json')
      .then((themes) => {
        this.availableStyles = Object
          .entries(themes)
          .map(([key, data]) => ({ key, data, name: data.name || data[0], version: 'v2' }))
      })

    getThemeResources('/static/palettes/index.json')
      .then((palettes) => {
        const result = {}
        console.log(palettes)
        Object.entries(palettes).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            const [
              name,
              background,
              foreground,
              text,
              link,
              cRed = '#FF0000',
              cBlue = '#0000FF',
              cGreen = '#00FF00',
              cOrange = '#E3FF00'
            ] = v
            result[k] = { name, background, foreground, text, link, cRed, cBlue, cGreen, cOrange }
          } else {
            result[k] = v
          }
        })
        this.availablePalettes = result
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
    isCustomThemeUsed () {
      const { theme } = this.mergedConfig
      return theme === 'custom' || theme === null
    },
    ...SharedComputedObject()
  },
  methods: {
    updateFont (key, value) {
      console.log(key, value)
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
    isThemeActive (key) {
      const { theme } = this.mergedConfig
      return key === theme
    },
    setTheme (name) {
      this.$store.dispatch('setTheme', { themeName: name, saveData: true, recompile: true })
    },
    setPalette (name) {
      this.$store.dispatch('setPalette', { paletteData: name })
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
