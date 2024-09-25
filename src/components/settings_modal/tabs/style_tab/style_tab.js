import { ref, reactive, computed, watch } from 'vue'

import Select from 'src/components/select/select.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ComponentPreview from 'src/components/component_preview/component_preview.vue'
import StringSetting from '../../helpers/string_setting.vue'
import ShadowControl from 'src/components/shadow_control/shadow_control.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'

import { init } from 'src/services/theme_data/theme_data_3.service.js'
import { getCssRules } from 'src/services/theme_data/css_utils.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFloppyDisk, faFolderOpen, faFile } from '@fortawesome/free-solid-svg-icons'

const toValue = (x) => JSON.parse(JSON.stringify(x === undefined ? '"lol"' : x))

library.add(
  faFile,
  faFloppyDisk,
  faFolderOpen
)

export default {
  components: {
    Select,
    Checkbox,
    StringSetting,
    ComponentPreview,
    TabSwitcher,
    ShadowControl
  },
  setup () {
    // Meta stuff
    const name = ref('')
    const author = ref('')
    const license = ref('')
    const website = ref('')

    // Initialization stuff
    const palette = {
      // These are here just to establish order,
      // themes should override those
      bg: '#121a24',
      fg: '#182230',
      text: '#b9b9ba',
      link: '#d8a070',
      accent: '#d8a070',
      cRed: '#FF0000',
      cBlue: '#0095ff',
      cGreen: '#0fa00f',
      cOrange: '#ffa500'
    }

    const getI18nPath = (componentName) => `settings.style.themes3.editor.components.${componentName}`

    const getFriendlyNamePath = (componentName) => getI18nPath(componentName) + '.friendlyName'

    const getVariantPath = (componentName, variant) => {
      return variant === 'normal'
        ? 'settings.style.themes3.editor.components.normal.variant'
        : `${getI18nPath(componentName)}.variants.${variant}`
    }
    const getStatePath = (componentName, state) => {
      return state === 'normal'
        ? 'settings.style.themes3.editor.components.normal.state'
        : `${getI18nPath(componentName)}.states.${state}`
    }

    // Getting existing components
    const componentsContext = require.context('src', true, /\.style.js(on)?$/)
    const componentKeysAll = componentsContext.keys()

    const componentsMap = new Map(
      componentKeysAll
        .map(
          key => [key, componentsContext(key).default]
        ).filter(([key, component]) => !component.virtual && !component.notEditable)
    )
    const componentKeys = [...componentsMap.keys()]

    // Initializing selected component and its computed descendants
    const selectedComponentKey = ref(componentsMap.keys().next().value)
    const selectedComponent = computed(() => componentsMap.get(selectedComponentKey.value))
    const selectedComponentName = computed(() => selectedComponent.value.name)

    const selectedVariant = ref('normal')
    const selectedComponentVariantsAll = computed(() => {
      return Object.keys({ normal: null, ...(selectedComponent.value.variants || {}) })
    })
    // const selectedComponentVariants = computed(() => {
    //   return selectedComponentVariantsAll.value.filter(x => x !== 'normal')
    // })

    const selectedStates = reactive(new Set())
    const selectedComponentStatesAll = computed(() => {
      return Object.keys({ normal: null, ...(selectedComponent.value.states || {}) })
    })
    const selectedComponentStates = computed(() => {
      return selectedComponentStatesAll.value.filter(x => x !== 'normal')
    })

    // Preview stuff
    const editorHintStyle = computed(() => {
      const editorHint = selectedComponent.value.editor
      const styles = []
      if (editorHint && Object.keys(editorHint).length > 0) {
        if (editorHint.aspect != null) {
          styles.push(`aspect-ratio: ${editorHint.aspect} !important;`)
        }
        if (editorHint.border != null) {
          styles.push(`border-width: ${editorHint.border}px !important;`)
        }
      }
      return styles.join('; ')
    })

    const simulatePseudoSelectors = css => css
      .replace(selectedComponent.value.selector, '.ComponentPreview .preview-block')
      .replace(':active', '.preview-active')
      .replace(':hover', '.preview-hover')
      .replace(':active', '.preview-active')
      .replace(':focus', '.preview-focus')
      .replace(':focus-within', '.preview-focus-within')
      .replace(':disabled', '.preview-disabled')

    const previewRules = reactive([])
    const previewClass = computed(() => {
      const selectors = []
      if (!!selectedComponent.value.variants?.normal || selectedVariant.value !== 'normal') {
        selectors.push(selectedComponent.value.variants[selectedVariant.value])
      }
      if (selectedStates.size > 0) {
        selectedStates.forEach(state => {
          const original = selectedComponent.value.states[state]
          selectors.push(simulatePseudoSelectors(original))
        })
      }
      return selectors.map(x => x.substring(1)).join('')
    })
    const previewCss = computed(() => {
      const scoped = getCssRules(previewRules)
        .map(simulatePseudoSelectors)
      return scoped.join('\n')
    })

    // Rules stuff
    const selectedComponentRulesList = reactive([])
    const selectedComponentRulesObject = computed(() => {
      const result = {}
      selectedComponentRulesList.forEach(
        (rule) => {
          const component = rule.component
          const { variant = 'normal', state = [] } = rule
          result[component] = result[component] || {}
          result[component][variant] = result[component][variant] || {}
          result[component][variant][state.join(':')] = rule
        }
      )
      return result
    })

    // Edited rule
    const editedRuleFallback = computed(() => {
      const component = selectedComponentName.value
      const variant = selectedVariant.value
      const states = ['normal', ...selectedStates.keys()].join(':')
      return selectedComponentRulesObject.value[component]?.[variant]?.[states]
    })

    const editedShadow = computed(() => {
      return editedRuleFallback.value?.directives.shadow
    })

    const updateSelectedComponent = () => {
      selectedVariant.value = 'normal'
      selectedStates.clear()

      const processedRulesList = selectedComponent.value.defaultRules.map(r => {
        const rule = {
          component: selectedComponentName.value,
          variant: 'normal',
          ...r,
          state: ['normal', ...(r.state || []).filter(x => x !== 'normal')]
        }
        return rule
      })

      selectedComponentRulesList.splice(0, selectedComponentRulesList.length)
      selectedComponentRulesList.push(...processedRulesList)

      console.log('FALLBACK', toValue(editedRuleFallback.value))

      previewRules.splice(0, previewRules.length)
      previewRules.push(...init({
        inputRuleset: [{
          component: selectedComponentName.value
        }],
        initialStaticVars: {
          ...palette
        },
        ultimateBackgroundColor: '#000000',
        rootComponentName: selectedComponentName.value,
        editMode: true,
        debug: true
      }).eager)
    }

    updateSelectedComponent()

    watch(
      selectedComponentName,
      updateSelectedComponent
    )

    return {
      name,
      author,
      license,
      website,
      componentKeys,
      componentsMap,
      selectedComponent,
      selectedComponentName,
      selectedComponentKey,
      selectedComponentVariantsAll,
      selectedComponentStates,
      selectedComponentRulesObject,
      selectedVariant,
      selectedStates,
      updateSelectedStates (state, v) {
        if (v) {
          selectedStates.add(state)
        } else {
          selectedStates.delete(state)
        }
      },
      editedRuleFallback,
      editedShadow,
      previewCss,
      previewClass,
      editorHintStyle,
      getFriendlyNamePath,
      getVariantPath,
      getStatePath,
      fallbackI18n (translated, fallback) {
        if (translated.startsWith('settings.style.themes3')) {
          return fallback
        }
        return translated
      }
    }
  }
}
