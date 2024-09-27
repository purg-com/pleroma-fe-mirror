import { ref, reactive, computed, watch } from 'vue'
import { get, set } from 'lodash'

import Select from 'src/components/select/select.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ComponentPreview from 'src/components/component_preview/component_preview.vue'
import StringSetting from '../../helpers/string_setting.vue'
import ShadowControl from 'src/components/shadow_control/shadow_control.vue'
import ColorInput from 'src/components/color_input/color_input.vue'
import OpacityInput from 'src/components/opacity_input/opacity_input.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import Popover from 'src/components/popover/popover.vue'

import { init } from 'src/services/theme_data/theme_data_3.service.js'
import { getCssRules } from 'src/services/theme_data/css_utils.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFloppyDisk, faFolderOpen, faFile } from '@fortawesome/free-solid-svg-icons'

// helper for debugging
// eslint-disable-next-line no-unused-vars
const toValue = (x) => JSON.parse(JSON.stringify(x === undefined ? 'null' : x))

// helper to make states comparable
const normalizeStates = (states) => ['normal', ...(states?.filter(x => x !== 'normal') || [])].join(':')

library.add(
  faFile,
  faFloppyDisk,
  faFolderOpen
)

export default {
  components: {
    Select,
    Checkbox,
    Popover,
    StringSetting,
    ComponentPreview,
    TabSwitcher,
    ShadowControl,
    ColorInput,
    OpacityInput
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

    const selectedState = reactive(new Set())
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
      if (selectedState.size > 0) {
        selectedState.forEach(state => {
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

    // Rules stuff aka meat and potatoes
    const editorFriendlyFallbackStructure = computed(() => {
      const root = {}

      componentKeys.forEach((componentKey) => {
        const componentValue = componentsMap.get(componentKey)
        const { defaultRules } = componentValue
        defaultRules.forEach((rule) => {
          const { parent: rParent } = rule
          const parent = rParent ?? rule
          const hasChildren = !!rParent
          const child = hasChildren ? rule : null

          const {
            component: pComponent,
            variant: pVariant = 'normal',
            state: pState = [] // no relation to Intel CPUs whatsoever
          } = parent

          const pPath = `${pComponent}.${pVariant}.${normalizeStates(pState)}`

          let output = get(root, pPath)
          if (!output) {
            set(root, pPath, {})
            output = get(root, pPath)
          }

          if (hasChildren) {
            output._children = output._children ?? {}
            const {
              component: cComponent,
              variant: cVariant = 'normal',
              state: cState = [],
              directives
            } = child

            const cPath = `${cComponent}.${cVariant}.${normalizeStates(cState)}`
            set(output._children, cPath, directives)
          }
        })
      })

      return root
    })

    // All rules that are made by editor
    const allEditedRules = reactive({})

    const componentHas = (subComponent) => {
      return !!selectedComponent.value.validInnerComponents?.find(x => x === subComponent)
    }

    const getPath = (component, directive) => {
      const pathSuffix = component ? `._children.${component}.normal.normal` : ''
      const path = `${selectedComponentName.value}.${selectedVariant.value}.${normalizeStates([...selectedState])}${pathSuffix}.directives.${directive}`
      return path
    }
    const isElementPresent = (component, directive, defaultValue = '') => computed({
      get () {
        return get(allEditedRules, getPath(component, directive)) != null
      },
      set (value) {
        if (value) {
          set(allEditedRules, getPath(component, directive), defaultValue)
        } else {
          set(allEditedRules, getPath(component, directive), null)
        }
      }
    })

    const getEditedElement = (component, directive) => computed({
      get () {
        let usedRule
        const fallback = editorFriendlyFallbackStructure
        const real = allEditedRules
        const path = getPath(component, directive)

        usedRule = get(real, path) // get real
        if (!usedRule) {
          console.log('FALLBACK')
          usedRule = get(fallback, path)
        } else {
          console.log('REAL')
        }

        console.log('GET', path, toValue(usedRule))

        return usedRule
      },
      set (value) {
        console.log(1, toValue(allEditedRules))
        set(allEditedRules, getPath(component, directive))
        console.log(2, toValue(allEditedRules))
      }
    })

    const editedBackgroundColor = getEditedElement(null, 'background')
    const editedOpacity = getEditedElement(null, 'opacity')
    const editedTextColor = getEditedElement('Text', 'color')
    const editedLinkColor = getEditedElement('Link', 'color')
    const editedIconColor = getEditedElement('Icon', 'color')
    const editedShadow = getEditedElement(null, 'shadow')

    const isBackgroundColorPresent = isElementPresent(null, 'background', '#FFFFFF')
    const isOpacityPresent = isElementPresent(null, 'opacity', 1)
    const isTextColorPresent = isElementPresent('Text', 'color', '#000000')
    const isLinkColorPresent = isElementPresent('Link', 'color', '#000080')
    const isIconColorPresent = isElementPresent('Icon', 'color', '#909090')
    const isShadowPresent = isElementPresent(null, 'shadow', [{ x: 0, y: 0, blur: 0, color: '#000000' }])

    const updateSelectedComponent = () => {
      selectedVariant.value = 'normal'
      selectedState.clear()

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

    const isShadowTabOpen = ref(false)
    const onTabSwitch = (tab) => {
      isShadowTabOpen.value = tab === 'shadow'
    }

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
      selectedVariant,
      selectedState,
      updateSelectedStates (state, v) {
        if (v) {
          selectedState.add(state)
        } else {
          selectedState.delete(state)
        }
      },
      editedBackgroundColor,
      editedOpacity,
      editedTextColor,
      editedLinkColor,
      editedIconColor,
      editedShadow,
      isBackgroundColorPresent,
      isOpacityPresent,
      isTextColorPresent,
      isLinkColorPresent,
      isIconColorPresent,
      isShadowPresent,
      previewCss,
      previewClass,
      editorHintStyle,
      getFriendlyNamePath,
      getVariantPath,
      getStatePath,
      componentHas,
      isShadowTabOpen,
      onTabSwitch,
      fallbackI18n (translated, fallback) {
        if (translated.startsWith('settings.style.themes3')) {
          return fallback
        }
        return translated
      }
    }
  }
}
