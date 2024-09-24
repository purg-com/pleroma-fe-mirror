import { ref, reactive, computed, watch } from 'vue'

import Select from 'src/components/select/select.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ComponentPreview from 'src/components/component_preview/component_preview.vue'
import StringSetting from '../../helpers/string_setting.vue'

import { init } from 'src/services/theme_data/theme_data_3.service.js'
import { getCssRules } from 'src/services/theme_data/css_utils.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFloppyDisk, faFolderOpen, faFile } from '@fortawesome/free-solid-svg-icons'

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
    ComponentPreview
  },
  setup () {
    const name = ref('')
    const author = ref('')
    const license = ref('')
    const website = ref('')

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
    const componentKeysRaw = componentsContext.keys()

    const componentsMap = new Map(
      componentKeysRaw
        .map(
          key => [key, componentsContext(key).default]
        ).filter(([key, component]) => !component.virtual && !component.notEditable)
    )
    const componentKeys = [...componentsMap.keys()]

    // const componentValues = componentsMap.values()

    // Initializing selected component and its computed descendants
    const selectedComponentKey = ref(componentKeys[0])
    const selectedComponentValue = computed(() => componentsMap.get(selectedComponentKey.value))

    const selectedComponentName = computed(() => selectedComponentValue.value.name)
    const selectedComponentVariants = computed(() => {
      return new Set(['normal', ...(Object.keys(selectedComponentValue.value.variants || {}))])
    })
    const selectedComponentStates = computed(() => {
      return new Set([...(Object.keys(selectedComponentValue.value.states || {}).filter(x => x !== 'normal'))])
    })

    const selectedVariant = ref('normal')
    const selectedStates = reactive(new Set())

    const updateSelectedStates = (state, v) => {
      if (v) {
        selectedStates.add(state)
      } else {
        selectedStates.delete(state)
      }
    }

    const simulatePseudoSelectors = css => css
      .replace(selectedComponentValue.value.selector, '.ComponentPreview .preview-block')
      .replace(':active', '.preview-active')
      .replace(':hover', '.preview-hover')
      .replace(':active', '.preview-active')
      .replace(':focus', '.preview-focus')
      .replace(':focus-within', '.preview-focus-within')
      .replace(':disabled', '.preview-disabled')

    const previewRules = reactive([])
    const previewClass = computed(() => {
      const selectors = []
      if (!!selectedComponentValue.value.variants?.normal || selectedVariant.value !== 'normal') {
        selectors.push(selectedComponentValue.value.variants[selectedVariant.value])
      }
      if (selectedStates.size > 0) {
        selectedStates.forEach(state => {
          const original = selectedComponentValue.value.states[state]
          selectors.push(simulatePseudoSelectors(original))
        })
      }
      return selectors.map(x => x.substring(1)).join('')
    })

    const editorHintStyle = computed(() => {
      const editorHint = selectedComponentValue.value.editor
      const styles = []
      if (editorHint && Object.keys(editorHint).length > 0) {
        console.log('EH', editorHint)
        if (editorHint.aspect != null) {
          styles.push(`aspect-ratio: ${editorHint.aspect} !important;`)
        }
        if (editorHint.border != null) {
          styles.push(`border-width: ${editorHint.border}px !important;`)
        }
      }
      console.log('EH', styles)
      return styles.join('; ')
    })

    const previewCss = computed(() => {
      const scoped = getCssRules(previewRules)
        .map(simulatePseudoSelectors)
      return scoped.join('\n')
    })

    const updateSelectedComponent = () => {
      selectedVariant.value = 'normal'
      selectedStates.clear()

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

      selectedComponentValue,
      selectedComponentName,
      selectedComponentKey,
      selectedComponentVariants,
      selectedComponentStates,
      updateSelectedStates,
      selectedVariant,
      selectedStates,
      getFriendlyNamePath,
      getStatePath,
      getVariantPath,
      editorHintStyle,
      previewCss,
      previewClass,
      fallbackI18n (translated, fallback) {
        if (translated.startsWith('settings.style.themes3')) {
          return fallback
        }
        return translated
      }
    }
  }
}
