import { ref, reactive, computed, watch } from 'vue'
import { get, set } from 'lodash'

import Select from 'src/components/select/select.vue'
import SelectMotion from 'src/components/select/select_motion.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ComponentPreview from 'src/components/component_preview/component_preview.vue'
import StringSetting from '../../helpers/string_setting.vue'
import ShadowControl from 'src/components/shadow_control/shadow_control.vue'
import ColorInput from 'src/components/color_input/color_input.vue'
import PaletteEditor from 'src/components/palette_editor/palette_editor.vue'
import OpacityInput from 'src/components/opacity_input/opacity_input.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import Tooltip from 'src/components/tooltip/tooltip.vue'
import ContrastRatio from 'src/components/contrast_ratio/contrast_ratio.vue'

import { init } from 'src/services/theme_data/theme_data_3.service.js'
import { getCssRules } from 'src/services/theme_data/css_utils.js'
import { serialize } from 'src/services/theme_data/iss_serializer.js'
import { parseShadow /* , deserialize */ } from 'src/services/theme_data/iss_deserializer.js'
import {
  // rgb2hex,
  hex2rgb,
  getContrastRatio
} from 'src/services/color_convert/color_convert.js'
import {
  // newImporter,
  newExporter
} from 'src/services/export_import/export_import.js'

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
    SelectMotion,
    Checkbox,
    Tooltip,
    StringSetting,
    ComponentPreview,
    TabSwitcher,
    ShadowControl,
    ColorInput,
    PaletteEditor,
    OpacityInput,
    ContrastRatio
  },
  setup () {
    // All rules that are made by editor
    const allEditedRules = reactive({})

    // ## Meta stuff
    const name = ref('')
    const author = ref('')
    const license = ref('')
    const website = ref('')

    const metaOut = computed(() => {
      return [
        '@meta {',
        `  name: ${name.value};`,
        `  author: ${author.value};`,
        `  license: ${license.value};`,
        `  website: ${website.value};`,
        '}'
      ].join('\n')
    })

    // ## Palette stuff
    const palettes = reactive([
      {
        name: 'dark',
        bg: '#121a24',
        fg: '#182230',
        text: '#b9b9ba',
        link: '#d8a070',
        accent: '#d8a070',
        cRed: '#FF0000',
        cBlue: '#0095ff',
        cGreen: '#0fa00f',
        cOrange: '#ffa500'
      },
      {
        name: 'light',
        bg: '#f2f6f9',
        fg: '#d6dfed',
        text: '#304055',
        underlay: '#5d6086',
        accent: '#f55b1b',
        cBlue: '#0095ff',
        cRed: '#d31014',
        cGreen: '#0fa00f',
        cOrange: '#ffa500',
        border: '#d8e6f9'
      }
    ])
    const selectedPaletteId = ref(0)
    const selectedPalette = computed({
      get () {
        return palettes[selectedPaletteId.value]
      },
      set (newPalette) {
        palettes[selectedPaletteId.value] = newPalette
      }
    })
    const getNewPalette = () => ({
      name: 'new palette',
      bg: '#121a24',
      fg: '#182230',
      text: '#b9b9ba',
      link: '#d8a070',
      accent: '#d8a070',
      cRed: '#FF0000',
      cBlue: '#0095ff',
      cGreen: '#0fa00f',
      cOrange: '#ffa500'
    })

    const palettesOut = computed(() => {
      return palettes.map(({ name, ...palette }) => {
        const entries = Object
          .entries(palette)
          .map(([slot, data]) => `  ${slot}: ${data};`)
          .join('\n')

        return `@palette.${name} {\n${entries}\n}`
      }).join('\n\n')
    })

    // ## Components stuff
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

    // selection basis
    const selectedComponentKey = ref(componentsMap.keys().next().value)
    const selectedComponent = computed(() => componentsMap.get(selectedComponentKey.value))
    const selectedComponentName = computed(() => selectedComponent.value.name)
    const selectedComponentVariants = computed(() => {
      return Object.keys({ normal: null, ...(selectedComponent.value.variants || {}) })
    })
    const selectedComponentStatesAll = computed(() => {
      return Object.keys({ normal: null, ...(selectedComponent.value.states || {}) })
    })
    const selectedComponentStates = computed(() => {
      return selectedComponentStatesAll.value.filter(x => x !== 'normal')
    })

    // selection
    const selectedVariant = ref('normal')
    const selectedState = reactive(new Set())
    const updateSelectedStates = (state, v) => {
      if (v) {
        selectedState.add(state)
      } else {
        selectedState.delete(state)
      }
    }

    // ### Rules stuff aka meat and potatoes
    // The native structure of separate rules and the child -> parent
    // relation isn't very convenient for editor, we replace the array
    // and child -> parent structure with map and parent -> child structure
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

          const pPath = `${hasChildren ? pComponent : componentValue.name}.${pVariant}.${normalizeStates(pState)}`

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
          } else {
            output.directives = parent.directives
          }
        })
      })

      return root
    })

    // Checkging whether component can support some "directives" which
    // are actually virtual subcomponents, i.e. Text, Link etc
    const componentHas = (subComponent) => {
      return !!selectedComponent.value.validInnerComponents?.find(x => x === subComponent)
    }

    // Path is path for lodash's get and set
    const getPath = (component, directive) => {
      const pathSuffix = component ? `._children.${component}.normal.normal` : ''
      const path = `${selectedComponentName.value}.${selectedVariant.value}.${normalizeStates([...selectedState])}${pathSuffix}.directives.${directive}`
      return path
    }

    // Templates for directives
    const isElementPresent = (component, directive, defaultValue = '') => computed({
      get () {
        return get(allEditedRules, getPath(component, directive)) != null
      },
      set (value) {
        if (value) {
          const fallback = get(
            editorFriendlyFallbackStructure.value,
            getPath(component, directive)
          )
          set(allEditedRules, getPath(component, directive), fallback ?? defaultValue)
        } else {
          set(allEditedRules, getPath(component, directive), null)
        }
      }
    })

    const getEditedElement = (component, directive, postProcess = x => x) => computed({
      get () {
        let usedRule
        const fallback = editorFriendlyFallbackStructure.value
        const real = allEditedRules
        const path = getPath(component, directive)

        usedRule = get(real, path) // get real
        if (!usedRule) {
          usedRule = get(fallback, path)
        }

        if (directive === 'shadow') {
          console.log('EDITED', usedRule)
          console.log('PP', postProcess(usedRule))
        }
        return postProcess(usedRule)
      },
      set (value) {
        set(allEditedRules, getPath(component, directive), value)
      }
    })

    // All the editable stuff for the component
    const editedBackgroundColor = getEditedElement(null, 'background')
    const isBackgroundColorPresent = isElementPresent(null, 'background', '#FFFFFF')
    const editedOpacity = getEditedElement(null, 'opacity')
    const isOpacityPresent = isElementPresent(null, 'opacity', 1)
    const editedTextColor = getEditedElement('Text', 'textColor')
    const isTextColorPresent = isElementPresent('Text', 'textColor', '#000000')
    const editedTextAuto = getEditedElement('Text', 'textAuto')
    const isTextAutoPresent = isElementPresent('Text', 'textAuto', '#000000')
    const editedLinkColor = getEditedElement('Link', 'textColor')
    const isLinkColorPresent = isElementPresent('Link', 'textColor', '#000080')
    const editedIconColor = getEditedElement('Icon', 'textColor')
    const isIconColorPresent = isElementPresent('Icon', 'textColor', '#909090')
    // TODO this is VERY primitive right now, need to make it
    // support variables, fallbacks etc.
    const getContrast = (bg, text) => {
      try {
        const bgRgb = hex2rgb(bg)
        const textRgb = hex2rgb(text)

        const ratio = getContrastRatio(bgRgb, textRgb)
        return {
          // TODO this ideally should be part of <ContractRatio />
          ratio,
          text: ratio.toPrecision(3) + ':1',
          // AA level, AAA level
          aa: ratio >= 4.5,
          aaa: ratio >= 7,
          // same but for 18pt+ texts
          laa: ratio >= 3,
          laaa: ratio >= 4.5
        }
      } catch (e) {
        console.warn('Failure computing contrast', e)
        return { error: e }
      }
    }

    const normalizeShadows = (shadows) => {
      console.log('NORMALIZE')
      return shadows?.map(shadow => {
        if (typeof shadow === 'object') {
          return shadow
        }
        if (typeof shadow === 'string') {
          return parseShadow(shadow)
        }
        return null
      })
    }

    // Shadow is partially edited outside the ShadowControl
    // for better space utilization
    const editedShadow = getEditedElement(null, 'shadow', normalizeShadows)
    const editedSubShadowId = ref(null)
    const editedSubShadow = computed(() => {
      if (editedShadow.value == null || editedSubShadowId.value == null) return null
      return editedShadow.value[editedSubShadowId.value]
    })
    const isShadowPresent = isElementPresent(null, 'shadow', [])
    const onSubShadow = (id) => {
      if (id != null) {
        editedSubShadowId.value = id
      } else {
        editedSubShadow.value = null
      }
    }
    const updateSubShadow = (axis, value) => {
      if (!editedSubShadow.value || editedSubShadowId.value == null) return
      const newEditedShadow = [...editedShadow.value]

      newEditedShadow[editedSubShadowId.value] = {
        ...newEditedShadow[editedSubShadowId.value],
        [axis]: value
      }

      editedShadow.value = newEditedShadow
    }
    const isShadowTabOpen = ref(false)
    const onTabSwitch = (tab) => {
      isShadowTabOpen.value = tab === 'shadow'
    }

    // component preview
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
    // Apart from "hover" we can't really show how component looks like in
    // certain states, so we have to fake them.
    const simulatePseudoSelectors = css => css
      .replace(selectedComponent.value.selector, '.ComponentPreview .preview-block')
      .replace(':active', '.preview-active')
      .replace(':hover', '.preview-hover')
      .replace(':active', '.preview-active')
      .replace(':focus', '.preview-focus')
      .replace(':focus-within', '.preview-focus-within')
      .replace(':disabled', '.preview-disabled')
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
    const previewRules = reactive([])
    const previewCss = computed(() => {
      try {
        const scoped = getCssRules(previewRules).map(simulatePseudoSelectors)
        return scoped.join('\n')
      } catch (e) {
        console.error('Invalid ruleset', e)
        return null
      }
    })
    const editorFriendlyToOriginal = computed(() => {
      const resultRules = []

      const convert = (component, data = {}, parent) => {
        const variants = Object.entries(data || {})

        variants.forEach(([variant, variantData]) => {
          const states = Object.entries(variantData)

          states.forEach(([jointState, stateData]) => {
            const state = jointState.split(/:/g)
            const result = {
              component,
              variant,
              state,
              directives: stateData.directives || {}
            }

            if (parent) {
              result.parent = {
                component: parent
              }
            }

            resultRules.push(result)

            // Currently we only support single depth for simplicity's sake
            if (!parent) {
              Object.entries(stateData._children || {}).forEach(([cName, child]) => convert(cName, child, component))
            }
          })
        })
      }

      convert(selectedComponentName.value, allEditedRules[selectedComponentName.value])

      return resultRules
    })

    const updatePreview = () => {
      try {
        const { name, ...paletteData } = selectedPalette.value
        // This normally would be handled by Root but since we pass something
        // else we have to make do ourselves
        paletteData.accent = paletteData.accent || paletteData.link
        paletteData.link = paletteData.link || paletteData.accent
        const rules = init({
          inputRuleset: editorFriendlyToOriginal.value,
          initialStaticVars: {
            ...paletteData
          },
          ultimateBackgroundColor: '#000000',
          rootComponentName: selectedComponentName.value,
          editMode: true,
          debug: true
        }).eager
        previewRules.splice(0, previewRules.length)
        previewRules.push(...rules)
      } catch (e) {
        console.error('Could not compile preview theme', e)
      }
    }

    const updateSelectedComponent = () => {
      selectedVariant.value = 'normal'
      selectedState.clear()
      updatePreview()
    }
    updateSelectedComponent()

    // export and import
    watch(
      allEditedRules,
      updatePreview
    )

    watch(
      palettes,
      updatePreview
    )

    watch(
      selectedPalette,
      updatePreview
    )

    watch(
      selectedComponentName,
      updateSelectedComponent
    )

    // ## Variables
    const allCustomVirtualDirectives = [...componentsMap.values()]
      .map(c => {
        return c
          .defaultRules
          .filter(c => c.component === 'Root')
          .map(x => Object.entries(x.directives))
          .flat()
      })
      .filter(x => x)
      .flat()
      .map(([name, value]) => {
        const [valType, valVal] = value.split('|')
        return {
          name: name.substring(2),
          valType: valType.trim(),
          value: valVal.trim()
        }
      })
    const virtualDirectives = reactive(allCustomVirtualDirectives)
    const selectedVirtualDirectiveId = ref(0)
    const selectedVirtualDirective = computed(() => virtualDirectives[selectedVirtualDirectiveId.value])
    const selectedVirtualDirectiveParsed = computed({
      get () {
        switch (selectedVirtualDirective.value.valType) {
          case 'shadow': {
            const directiveValue = selectedVirtualDirective.value.value
            if (Array.isArray(directiveValue)) {
              return normalizeShadows(directiveValue)
            } else {
              const splitShadow = directiveValue.split(/,/g).map(x => x.trim())
              return normalizeShadows(splitShadow)
            }
          }
          default:
            return null
        }
      }
    })

    const getNewDirective = () => ({
      name: 'newDirective',
      valType: 'generic',
      value: 'foobar'
    })

    // ## Export and Import
    const styleExporter = newExporter({
      filename: name.value || 'pleroma_theme',
      mime: 'text/plain',
      extension: 'piss',
      getExportedObject: () => exportStyleData.value
    })
    const exportStyleData = computed(() => {
      return [
        metaOut.value,
        palettesOut.value,
        serialize(editorFriendlyToOriginal.value)
      ].join('\n\n')
    })
    const exportStyle = () => {
      styleExporter.exportData()
    }

    return {
      // ## Meta
      name,
      author,
      license,
      website,

      // ## Palette
      palettes,
      selectedPalette,
      selectedPaletteId,
      getNewPalette,

      // ## Components
      componentKeys,
      componentsMap,

      // selection basis
      selectedComponent,
      selectedComponentName,
      selectedComponentKey,
      selectedComponentVariants,
      selectedComponentStates,

      // selection
      selectedVariant,
      selectedState,
      updateSelectedStates,

      // component directives
      componentHas,

      // component colors
      editedBackgroundColor,
      isBackgroundColorPresent,
      editedOpacity,
      isOpacityPresent,
      editedTextColor,
      isTextColorPresent,
      editedTextAuto,
      isTextAutoPresent,
      editedLinkColor,
      isLinkColorPresent,
      editedIconColor,
      isIconColorPresent,
      getContrast,

      // component shadow
      editedShadow,
      editedSubShadow,
      isShadowPresent,
      onSubShadow,
      updateSubShadow,
      isShadowTabOpen,
      onTabSwitch,

      // component preview
      editorHintStyle,
      previewCss,
      previewClass,

      // ## Variables
      virtualDirectives,
      selectedVirtualDirective,
      selectedVirtualDirectiveId,
      selectedVirtualDirectiveParsed,
      getNewDirective,

      // ## Export and Import
      exportStyle
    }
  }
}
