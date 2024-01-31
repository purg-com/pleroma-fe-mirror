import { convert, brightness } from 'chromatism'
import merge from 'lodash.merge'
import { alphaBlend, getTextColor, rgba2css, mixrgb, relativeLuminance } from '../color_convert/color_convert.js'

import Underlay from 'src/components/underlay.style.js'
import Panel from 'src/components/panel.style.js'
import PanelHeader from 'src/components/panel_header.style.js'
import Button from 'src/components/button.style.js'
import Text from 'src/components/text.style.js'
import Link from 'src/components/link.style.js'
import Icon from 'src/components/icon.style.js'

const root = Underlay
const components = {
  Underlay,
  Panel,
  PanelHeader,
  Button,
  Text,
  Link,
  Icon
}

// This gives you an array of arrays of all possible unique (i.e. order-insensitive) combinations
export const getAllPossibleCombinations = (array) => {
  const combos = [array.map(x => [x])]
  for (let comboSize = 2; comboSize <= array.length; comboSize++) {
    const previous = combos[combos.length - 1]
    const selfSet = new Set()
    const newCombos = previous.map(self => {
      self.forEach(x => selfSet.add(x))
      const nonSelf = array.filter(x => !selfSet.has(x))
      return nonSelf.map(x => [...self, x])
    })
    const flatCombos = newCombos.reduce((acc, x) => [...acc, ...x], [])
    combos.push(flatCombos)
  }
  return combos.reduce((acc, x) => [...acc, ...x], [])
}

export const ruleToSelector = (rule, isParent) => {
  const component = components[rule.component]
  const { states, variants, selector, outOfTreeSelector } = component

  const applicableStates = ((rule.state || []).filter(x => x !== 'normal')).map(state => states[state])

  const applicableVariantName = (rule.variant || 'normal')
  let applicableVariant = ''
  if (applicableVariantName !== 'normal') {
    applicableVariant = variants[applicableVariantName]
  }

  let realSelector
  if (isParent) {
    realSelector = selector
  } else {
    if (outOfTreeSelector) realSelector = outOfTreeSelector
    else realSelector = selector
  }

  const selectors = [realSelector, applicableVariant, ...applicableStates]
    .toSorted((a, b) => {
      if (a.startsWith(':')) return 1
      if (!a.startsWith('.')) return -1
      else return 0
    })
    .join('')

  if (rule.parent) {
    return ruleToSelector(rule.parent, true) + ' ' + selectors
  }
  return selectors
}

export const init = (extraRuleset, palette) => {
  const rootName = root.name
  const rules = []
  const rulesByComponent = {}

  const ruleset = [
    ...Object.values(components).map(c => c.defaultRules || []).reduce((acc, arr) => [...acc, ...arr], []),
    ...extraRuleset
  ]

  const addRule = (rule) => {
    rules.push(rule)
    rulesByComponent[rule.component] = rulesByComponent[rule.component] || []
    rulesByComponent[rule.component].push(rule)
  }

  const findRules = (searchCombination, parent) => rule => {
    // inexact search
    const doesCombinationMatch = () => {
      if (searchCombination.component !== rule.component) return false
      const ruleVariant = Object.prototype.hasOwnProperty.call(rule, 'variant') ? rule.variant : 'normal'

      if (ruleVariant !== 'normal') {
        if (searchCombination.variant !== rule.variant) return false
      }

      const ruleHasStateDefined = Object.prototype.hasOwnProperty.call(rule, 'state')
      let ruleStateSet
      if (ruleHasStateDefined) {
        ruleStateSet = new Set(['normal', ...rule.state])
      } else {
        ruleStateSet = new Set(['normal'])
      }

      if (ruleStateSet.size > 1) {
        const ruleStatesSet = ruleStateSet
        const combinationSet = new Set(['normal', ...searchCombination.state])
        const setsAreEqual = searchCombination.state.every(state => ruleStatesSet.has(state)) &&
              [...ruleStatesSet].every(state => combinationSet.has(state))
        return setsAreEqual
      } else {
        return true
      }
    }

    const combinationMatches = doesCombinationMatch()
    if (!parent || !combinationMatches) return combinationMatches

    // exact search

    // unroll parents into array
    const unroll = (item) => {
      const out = []
      let currentParent = item.parent
      while (currentParent) {
        const { parent: newParent, ...rest } = currentParent
        out.push(rest)
        currentParent = newParent
      }
      return out
    }
    const { parent: _, ...rest } = parent
    const pathSearch = [rest, ...unroll(parent)]
    const pathRule = unroll(rule)
    if (pathSearch.length !== pathRule.length) return false
    const pathsMatch = pathSearch.every((searchRule, i) => {
      const existingRule = pathRule[i]
      if (existingRule.component !== searchRule.component) return false
      if (existingRule.variant !== searchRule.variant) return false
      const existingRuleStatesSet = new Set(['normal', ...(existingRule.state || [])])
      const searchStatesSet = new Set(['normal', ...(searchRule.state || [])])
      const setsAreEqual = existingRule.state.every(state => searchStatesSet.has(state)) &&
              [...searchStatesSet].every(state => existingRuleStatesSet.has(state))
      return setsAreEqual
    })
    return pathsMatch
  }

  const findLowerLevelRule = (parent, filter = () => true) => {
    let lowerLevelComponent = null
    let currentParent = parent
    while (currentParent) {
      const rulesParent = ruleset.filter(findRules(currentParent))
      rulesParent > 1 && console.warn('OOPS')
      lowerLevelComponent = rulesParent[rulesParent.length - 1]
      currentParent = currentParent.parent
      if (lowerLevelComponent && filter(lowerLevelComponent)) currentParent = null
    }
    return filter(lowerLevelComponent) ? lowerLevelComponent : null
  }

  const findColor = (color, background) => {
    if (typeof color !== 'string' || !color.startsWith('--')) return color
    let targetColor = null
    // Color references other color
    const [variable, modifier] = color.split(/,/g).map(str => str.trim())
    const variableSlot = variable.substring(2)
    targetColor = palette[variableSlot]

    if (modifier) {
      const effectiveBackground = background ?? targetColor
      const isLightOnDark = relativeLuminance(convert(effectiveBackground).rgb) < 0.5
      const mod = isLightOnDark ? 1 : -1
      targetColor = brightness(Number.parseFloat(modifier) * mod, targetColor).rgb
    }

    return targetColor
  }

  const getTextColorAlpha = (rule, lowerRule, value) => {
    const opacity = rule.directives.textOpacity
    const backgroundColor = convert(lowerRule.cache.background).rgb
    const textColor = convert(findColor(value, backgroundColor)).rgb
    if (opacity === null || opacity === undefined || opacity >= 1) {
      return convert(textColor).hex
    }
    if (opacity === 0) {
      return convert(backgroundColor).hex
    }
    const opacityMode = rule.directives.textOpacityMode
    switch (opacityMode) {
      case 'fake':
        return convert(alphaBlend(textColor, opacity, backgroundColor)).hex
      case 'mixrgb':
        return convert(mixrgb(backgroundColor, textColor)).hex
      default:
        return rgba2css({ a: opacity, ...textColor })
    }
  }

  const processInnerComponent = (component, parent) => {
    const {
      validInnerComponents = [],
      states: originalStates = {},
      variants: originalVariants = {},
      name
    } = component

    const states = { normal: '', ...originalStates }
    const variants = { normal: '', ...originalVariants }
    const innerComponents = validInnerComponents.map(name => components[name])

    const stateCombinations = getAllPossibleCombinations(Object.keys(states))
    const stateVariantCombination = Object.keys(variants).map(variant => {
      return stateCombinations.map(state => ({ variant, state }))
    }).reduce((acc, x) => [...acc, ...x], [])

    const VIRTUAL_COMPONENTS = new Set(['Text', 'Link', 'Icon'])

    stateVariantCombination.forEach(combination => {
      let needRuleAdd = false

      if (VIRTUAL_COMPONENTS.has(component.name)) {
        const selector = component.name + ruleToSelector({ component: component.name, ...combination })
        const virtualName = [
          '--',
          component.name.toLowerCase(),
          combination.variant === 'normal'
            ? ''
            : combination.variant[0].toUpperCase() + combination.variant.slice(1).toLowerCase(),
          ...combination.state.filter(x => x !== 'normal').toSorted().map(state => state[0].toUpperCase() + state.slice(1).toLowerCase())
        ].join('')

        const lowerLevel = findLowerLevelRule(parent, (r) => {
          if (!r) return false
          if (components[r.component].validInnerComponents.indexOf(component.name) < 0) return false
          if (r.cache.background === undefined) return false
          if (r.cache.textDefined) {
            return !r.cache.textDefined[selector]
          }
          return true
        })

        if (!lowerLevel) return

        let inheritedTextColorRule
        const inheritedTextColorRules = findLowerLevelRule(parent, (r) => {
          return r.cache?.textDefined?.[selector]
        })

        if (!inheritedTextColorRule) {
          const generalTextColorRules = ruleset.filter(findRules({ component: component.name, ...combination }, null, true))
          inheritedTextColorRule = generalTextColorRules.reduce((acc, rule) => merge(acc, rule), {})
        } else {
          inheritedTextColorRule = inheritedTextColorRules.reduce((acc, rule) => merge(acc, rule), {})
        }

        let inheritedTextColor
        let inheritedTextOpacity = {}
        if (inheritedTextColorRule) {
          inheritedTextColor = findColor(inheritedTextColorRule.directives.textColor, convert(lowerLevel.cache.background).rgb)
          // also inherit opacity settings
          const { textOpacity, textOpacityMode } = inheritedTextColorRule.directives
          inheritedTextOpacity = { textOpacity, textOpacityMode }
        } else {
          // Emergency fallback
          inheritedTextColor = '#000000'
        }

        const textColor = getTextColor(
          convert(lowerLevel.cache.background).rgb,
          convert(inheritedTextColor).rgb,
          component.name === 'Link' // make it configurable?
        )

        lowerLevel.cache.textDefined = lowerLevel.cache.textDefined || {}
        lowerLevel.cache.textDefined[selector] = textColor
        lowerLevel.virtualDirectives = lowerLevel.virtualDirectives || {}
        lowerLevel.virtualDirectives[virtualName] = getTextColorAlpha(inheritedTextColorRule, lowerLevel, textColor)

        const directives = {
          textColor,
          ...inheritedTextOpacity
        }

        // Debug: lets you see what it think background color should be
        directives.background = convert(lowerLevel.cache.background).hex

        addRule({
          parent,
          virtual: true,
          component: component.name,
          ...combination,
          cache: { background: lowerLevel.cache.background },
          directives
        })
      } else {
        const existingGlobalRules = ruleset.filter(findRules({ component: component.name, ...combination }, null))
        const existingRules = ruleset.filter(findRules({ component: component.name, ...combination }, parent))

        // Global (general) rules
        if (existingGlobalRules.length !== 0) {
          const totalRule = existingGlobalRules.reduce((acc, rule) => merge(acc, rule), {})
          const { directives } = totalRule

          // last rule is used as a cache
          const lastRule = existingGlobalRules[existingGlobalRules.length - 1]
          lastRule.cache = lastRule.cache || {}

          if (directives.background) {
            const rgb = convert(findColor(directives.background)).rgb

            // TODO: DEFAULT TEXT COLOR
            const bg = findLowerLevelRule(parent)?.cache.background || convert('#FFFFFF').rgb

            if (!lastRule.cache.background) {
              const blend = directives.opacity < 1 ? alphaBlend(rgb, directives.opacity, bg) : rgb
              lastRule.cache.background = blend

              needRuleAdd = true
            }
          }

          if (needRuleAdd) {
            addRule(lastRule)
          }
        }

        if (existingRules.length !== 0) {
          console.warn('MORE EXISTING RULES', existingRules)
        }
      }
      innerComponents.forEach(innerComponent => processInnerComponent(innerComponent, { parent, component: name, ...combination }))
    })
  }

  processInnerComponent(components[rootName])

  return {
    raw: rules,
    css: rules.map(rule => {
      if (rule.virtual) return ''

      let selector = ruleToSelector(rule).replace(/\/\*.*\*\//g, '')
      if (!selector) {
        selector = 'body'
      }
      const header = selector + ' {'
      const footer = '}'

      const virtualDirectives = Object.entries(rule.virtualDirectives || {}).map(([k, v]) => {
        return '  ' + k + ': ' + v
      }).join(';\n')

      const directives = Object.entries(rule.directives).map(([k, v]) => {
        switch (k) {
          case 'background': {
            return 'background-color: ' + rgba2css({ ...convert(findColor(v)).rgb, a: rule.directives.opacity ?? 1 })
          }
          case 'textColor': {
            return 'color: ' + v
          }
          default: return ''
        }
      }).filter(x => x).map(x => '  ' + x).join(';\n')

      return [
        header,
        directives + ';',
        '  color: var(--text);',
        '',
        virtualDirectives,
        footer
      ].join('\n')
    }).filter(x => x)
  }
}
