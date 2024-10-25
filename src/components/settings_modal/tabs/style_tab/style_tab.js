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
import Preview from '../theme_tab/theme_preview.vue'

import { init, findColor } from 'src/services/theme_data/theme_data_3.service.js'
import {
  getCssRules,
  getScopedVersion
} from 'src/services/theme_data/css_utils.js'
import { serializeShadow, serialize } from 'src/services/theme_data/iss_serializer.js'
import { deserializeShadow, deserialize } from 'src/services/theme_data/iss_deserializer.js'
import {
  rgb2hex,
  hex2rgb,
  getContrastRatio
} from 'src/services/color_convert/color_convert.js'
import {
  newImporter,
  newExporter
} from 'src/services/export_import/export_import.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFloppyDisk,
  faFolderOpen,
  faFile,
  faArrowsRotate,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

// helper for debugging
// eslint-disable-next-line no-unused-vars
const toValue = (x) => JSON.parse(JSON.stringify(x === undefined ? 'null' : x))

// helper to make states comparable
const normalizeStates = (states) => ['normal', ...(states?.filter(x => x !== 'normal') || [])].join(':')

library.add(
  faFile,
  faFloppyDisk,
  faFolderOpen,
  faArrowsRotate,
  faCheck
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
    ContrastRatio,
    Preview
  },
  setup () {
    const exports = {}
    // All rules that are made by editor
    const allEditedRules = reactive({})

    // ## Meta stuff
    exports.name = ref('')
    exports.author = ref('')
    exports.license = ref('')
    exports.website = ref('')

    const metaOut = computed(() => {
      return [
        '@meta {',
        `  name: ${exports.name.value};`,
        `  author: ${exports.author.value};`,
        `  license: ${exports.license.value};`,
        `  website: ${exports.website.value};`,
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
    exports.palettes = palettes

    // This is kinda dumb but you cannot "replace" reactive() object
    // and so v-model simply fails when you try to chage (increase only?)
    // length of the array. Since linter complains about mutating modelValue
    // inside SelectMotion, the next best thing is to just wipe existing array
    // and replace it with new one.

    const onPalettesUpdate = (e) => {
      palettes.splice(0, palettes.length)
      palettes.push(...e)
    }
    exports.onPalettesUpdate = onPalettesUpdate

    const selectedPaletteId = ref(0)
    const selectedPalette = computed({
      get () {
        return palettes[selectedPaletteId.value]
      },
      set (newPalette) {
        palettes[selectedPaletteId.value] = newPalette
      }
    })
    exports.selectedPaletteId = selectedPaletteId
    exports.selectedPalette = selectedPalette

    exports.getNewPalette = () => ({
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
    exports.componentsMap = componentsMap
    const componentKeys = [...componentsMap.keys()]
    exports.componentKeys = componentKeys

    // selection basis
    const selectedComponentKey = ref(componentsMap.keys().next().value)
    exports.selectedComponentKey = selectedComponentKey
    const selectedComponent = computed(() => componentsMap.get(selectedComponentKey.value))
    const selectedComponentName = computed(() => selectedComponent.value.name)
    exports.selectedComponentVariants = computed(() => {
      return Object.keys({ normal: null, ...(selectedComponent.value.variants || {}) })
    })
    const selectedComponentStatesAll = computed(() => {
      return Object.keys({ normal: null, ...(selectedComponent.value.states || {}) })
    })
    exports.selectedComponentStates = computed(() => {
      return selectedComponentStatesAll.value.filter(x => x !== 'normal')
    })

    // selection
    const selectedVariant = ref('normal')
    exports.selectedVariant = selectedVariant
    const selectedState = reactive(new Set())
    exports.selectedState = selectedState
    exports.updateSelectedStates = (state, v) => {
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
    const rulesToEditorFriendly = (rules, root = {}) => rules.reduce((acc, rule) => {
      const { parent: rParent, component: rComponent } = rule
      const parent = rParent ?? rule
      const hasChildren = !!rParent
      const child = hasChildren ? rule : null

      const {
        component: pComponent,
        variant: pVariant = 'normal',
        state: pState = [] // no relation to Intel CPUs whatsoever
      } = parent

      const pPath = `${hasChildren ? pComponent : rComponent}.${pVariant}.${normalizeStates(pState)}`

      let output = get(acc, pPath)
      if (!output) {
        set(acc, pPath, {})
        output = get(acc, pPath)
      }

      if (hasChildren) {
        acc._children = acc._children ?? {}
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
      return acc
    }, root)

    const editorFriendlyFallbackStructure = computed(() => {
      const root = {}

      componentKeys.forEach((componentKey) => {
        const componentValue = componentsMap.get(componentKey)
        const { defaultRules, name } = componentValue
        rulesToEditorFriendly(
          defaultRules.map((rule) => ({ ...rule, component: name })),
          root
        )
      })

      return root
    })

    // Checkging whether component can support some "directives" which
    // are actually virtual subcomponents, i.e. Text, Link etc
    exports.componentHas = (subComponent) => {
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
    exports.editedBackgroundColor = getEditedElement(null, 'background')
    exports.isBackgroundColorPresent = isElementPresent(null, 'background', '#FFFFFF')
    exports.editedOpacity = getEditedElement(null, 'opacity')
    exports.isOpacityPresent = isElementPresent(null, 'opacity', 1)
    exports.editedTextColor = getEditedElement('Text', 'textColor')
    exports.isTextColorPresent = isElementPresent('Text', 'textColor', '#000000')
    exports.editedTextAuto = getEditedElement('Text', 'textAuto')
    exports.isTextAutoPresent = isElementPresent('Text', 'textAuto', '#000000')
    exports.editedLinkColor = getEditedElement('Link', 'textColor')
    exports.isLinkColorPresent = isElementPresent('Link', 'textColor', '#000080')
    exports.editedIconColor = getEditedElement('Icon', 'textColor')
    exports.isIconColorPresent = isElementPresent('Icon', 'textColor', '#909090')
    exports.editedBorderColor = getEditedElement('Border', 'textColor')
    exports.isBorderColorPresent = isElementPresent('Border', 'textColor', '#909090')

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
      return shadows?.map(shadow => {
        if (typeof shadow === 'object') {
          return shadow
        }
        if (typeof shadow === 'string') {
          try {
            return deserializeShadow(shadow)
          } catch (e) {
            console.warn(e)
          }
        }
        return null
      })
    }

    // Shadow is partially edited outside the ShadowControl
    // for better space utilization
    const editedShadow = getEditedElement(null, 'shadow', normalizeShadows)
    exports.editedShadow = editedShadow
    const editedSubShadowId = ref(null)
    exports.editedSubShadowId = editedSubShadowId
    const editedSubShadow = computed(() => {
      if (editedShadow.value == null || editedSubShadowId.value == null) return null
      return editedShadow.value[editedSubShadowId.value]
    })
    exports.editedSubShadow = editedSubShadow
    exports.isShadowPresent = isElementPresent(null, 'shadow', [])
    exports.onSubShadow = (id) => {
      if (id != null) {
        editedSubShadowId.value = id
      } else {
        editedSubShadow.value = null
      }
    }
    exports.updateSubShadow = (axis, value) => {
      if (!editedSubShadow.value || editedSubShadowId.value == null) return
      const newEditedShadow = [...editedShadow.value]

      newEditedShadow[editedSubShadowId.value] = {
        ...newEditedShadow[editedSubShadowId.value],
        [axis]: value
      }

      editedShadow.value = newEditedShadow
    }
    exports.isShadowTabOpen = ref(false)
    exports.onTabSwitch = (tab) => {
      exports.isShadowTabOpen.value = tab === 'shadow'
    }

    // component preview
    exports.editorHintStyle = computed(() => {
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
    exports.previewClass = computed(() => {
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
    exports.previewRules = previewRules
    exports.previewCss = computed(() => {
      try {
        const scoped = getCssRules(previewRules).map(simulatePseudoSelectors)
        return scoped.join('\n')
      } catch (e) {
        console.error('Invalid ruleset', e)
        return null
      }
    })

    const applicablePreviewRules = computed(() => {
      return previewRules.filter(rule => {
        const filterable = rule.parent ? rule.parent : rule
        const variantMatches = filterable.variant === selectedVariant.value
        const stateMatches = filterable.state.filter(x => x !== 'normal').every(x => selectedState.has(x))
        return variantMatches && stateMatches
      })
    })
    const previewColors = computed(() => ({
      text: applicablePreviewRules.value.find(r => r.component === 'Text')?.virtualDirectives['--text'],
      link: applicablePreviewRules.value.find(r => r.component === 'Link')?.virtualDirectives['--link'],
      border: applicablePreviewRules.value.find(r => r.component === 'Border')?.virtualDirectives['--border'],
      icon: applicablePreviewRules.value.find(r => r.component === 'Icon')?.virtualDirectives['--icon'],
      background: applicablePreviewRules.value.find(r => r.parent == null)?.dynamicVars.stacked
    }))
    exports.previewColors = previewColors

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
    exports.virtualDirectives = virtualDirectives

    exports.onVirtualDirectivesUpdate = (e) => {
      virtualDirectives.splice(0, virtualDirectives.length)
      virtualDirectives.push(...e)
    }

    const selectedVirtualDirectiveId = ref(0)
    exports.selectedVirtualDirectiveId = selectedVirtualDirectiveId

    const selectedVirtualDirective = computed({
      get () {
        return virtualDirectives[selectedVirtualDirectiveId.value]
      },
      set (value) {
        virtualDirectives[selectedVirtualDirectiveId.value].value = value
      }
    })
    exports.selectedVirtualDirective = selectedVirtualDirective

    exports.selectedVirtualDirectiveValType = computed({
      get () {
        return virtualDirectives[selectedVirtualDirectiveId.value].valType
      },
      set (value) {
        const newValType = value
        let newValue
        switch (value) {
          case 'shadow':
            newValue = '0 0 0 #000000 / 1'
            break
          case 'color':
            newValue = '#000000'
            break
          default:
            newValue = 'none'
        }
        const newName = virtualDirectives[selectedVirtualDirectiveId.value].name
        virtualDirectives[selectedVirtualDirectiveId.value] = {
          name: newName,
          value: newValue,
          valType: newValType
        }
      }
    })

    const draftVirtualDirectiveValid = ref(true)
    const draftVirtualDirective = ref({})
    exports.draftVirtualDirective = draftVirtualDirective

    watch(
      selectedVirtualDirective,
      (directive) => {
        switch (directive.valType) {
          case 'shadow': {
            if (Array.isArray(directive.value)) {
              draftVirtualDirective.value = normalizeShadows(directive.value)
            } else {
              const splitShadow = directive.value.split(/,/g).map(x => x.trim())
              draftVirtualDirective.value = normalizeShadows(splitShadow)
            }
            break
          }
          case 'color':
            draftVirtualDirective.value = directive.value
            break
          default:
            draftVirtualDirective.value = directive.value
            break
        }
      },
      { immediate: true }
    )

    watch(
      draftVirtualDirective,
      (directive) => {
        try {
          switch (selectedVirtualDirective.value.valType) {
            case 'shadow': {
              virtualDirectives[selectedVirtualDirectiveId.value].value =
                directive.map(x => serializeShadow(x)).join(', ')
              break
            }
            default:
              virtualDirectives[selectedVirtualDirectiveId.value].value = directive
          }
          draftVirtualDirectiveValid.value = true
        } catch (e) {
          console.error('Invalid virtual directive value', e)
          draftVirtualDirectiveValid.value = false
        }
      },
      { immediate: true }
    )

    const virtualDirectivesOut = computed(() => {
      return [
        'Root {',
        ...virtualDirectives.map(vd => `  --${vd.name}: ${vd.valType} | ${vd.value};`),
        '}'
      ].join('\n')
    })

    exports.getNewVirtualDirective = () => ({
      name: 'newDirective',
      valType: 'generic',
      value: 'foobar'
    })

    exports.computeColor = (color) => {
      const computedColor = findColor(color, { dynamicVars: {}, staticVars: selectedPalette.value })
      if (computedColor) {
        return rgb2hex(computedColor)
      }
      return null
    }

    exports.contrast = computed(() => {
      return getContrast(
        exports.computeColor(previewColors.value.background),
        exports.computeColor(previewColors.value.text)
      )
    })

    const overallPreviewRules = ref()
    exports.overallPreviewRules = overallPreviewRules
    exports.updateOverallPreview = () => {
      try {
        // This normally would be handled by Root but since we pass something
        // else we have to make do ourselves

        const { name, ...rest } = selectedPalette.value
        const paletteRule = {
          component: 'Root',
          directives: Object
            .entries(rest)
            .map(([k, v]) => ['--' + k, v])
            .reduce((acc, [k, v]) => ({ ...acc, [k]: `color | ${v}` }), {})
        }

        const virtualDirectivesRule = {
          component: 'Root',
          directives: Object.fromEntries(
            virtualDirectives.map(vd => [`--${vd.name}`, `${vd.valType} | ${vd.value}`])
          )
        }

        const rules = init({
          inputRuleset: [
            paletteRule,
            virtualDirectivesRule,
            ...editorFriendlyToOriginal.value
          ],
          ultimateBackgroundColor: '#000000',
          liteMode: true,
          debug: true
        }).eager

        overallPreviewRules.value = getScopedVersion(
          getCssRules(rules),
          '#edited-style-preview'
        ).join('\n')
      } catch (e) {
        console.error('Could not compile preview theme', e)
      }
    }

    // ## Export and Import
    const styleExporter = newExporter({
      filename: () => exports.name.value ?? 'pleroma_theme',
      mime: 'text/plain',
      extension: 'piss',
      getExportedObject: () => exportStyleData.value
    })

    const styleImporter = newImporter({
      accept: '.piss',
      parser: (string) => deserialize(string),
      onImport (parsed, filename) {
        const editorComponents = parsed.filter(x => x.component.startsWith('@'))
        const rootComponent = parsed.find(x => x.component === 'Root')
        const rules = parsed.filter(x => !x.component.startsWith('@') && x.component !== 'Root')
        const metaIn = editorComponents.find(x => x.component === '@meta').directives
        const palettesIn = editorComponents.filter(x => x.component === '@palette')

        exports.name.value = metaIn.name
        exports.license.value = metaIn.license
        exports.author.value = metaIn.author
        exports.website.value = metaIn.website

        virtualDirectives.splice(0, virtualDirectives.length)
        const newVirtualDirectives = Object
          .entries(rootComponent.directives)
          .map(([name, value]) => {
            const [valType, valVal] = value.split('|').map(x => x.trim())
            return { name: name.substring(2), valType, value: valVal }
          })
        virtualDirectives.push(...newVirtualDirectives)

        onPalettesUpdate(palettesIn.map(x => ({ name: x.variant, ...x.directives })))

        Object.keys(allEditedRules).forEach((k) => delete allEditedRules[k])

        rules.forEach(rule => {
          rulesToEditorFriendly(
            [rule],
            allEditedRules
          )
        })
      }
    })

    const exportStyleData = computed(() => {
      return [
        metaOut.value,
        palettesOut.value,
        virtualDirectivesOut.value,
        serialize(editorFriendlyToOriginal.value)
      ].join('\n\n')
    })

    exports.exportStyle = () => {
      styleExporter.exportData()
    }

    exports.importStyle = () => {
      styleImporter.importData()
    }

    return exports
  }
}
