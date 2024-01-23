import { convert } from 'chromatism'
import { alphaBlend, getTextColor, rgba2css } from '../color_convert/color_convert.js'

import Underlay from 'src/components/underlay.style.js'
import Panel from 'src/components/panel.style.js'
import PanelHeader from 'src/components/panel_header.style.js'
import Button from 'src/components/button.style.js'
import Text from 'src/components/text.style.js'
import Icon from 'src/components/icon.style.js'

const root = Underlay
const components = {
  Underlay,
  Panel,
  PanelHeader,
  Button,
  Text,
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

export const ruleToSelector = (rule) => {
  const component = components[rule.component]
  const { states, variants, selector } = component

  const applicableStates = ((rule.state || []).filter(x => x !== 'normal')).map(state => states[state])

  const applicableVariantName = (rule.variant || 'normal')
  let applicableVariant = ''
  if (applicableVariantName !== 'normal') {
    applicableVariant = variants[applicableVariantName]
  }

  const selectors = [selector, applicableVariant, ...applicableStates]
    .toSorted((a, b) => {
      if (a.startsWith(':')) return 1
      else return -1
    })
    .join('')

  if (rule.parent) {
    return ruleToSelector(rule.parent) + ' ' + selectors
  }
  return selectors
}

export const init = (ruleset) => {
  const rootName = root.name
  const rules = []
  const rulesByComponent = {}

  const addRule = (rule) => {
    rules.push(rule)
    rulesByComponent[rule.component] = rulesByComponent[rule.component] || []
    rulesByComponent[rule.component].push(rule)
  }

  const findRules = (combination) => rule => {
    if (combination.component !== rule.component) return false
    if (Object.prototype.hasOwnProperty.call(rule, 'variant')) {
      if (combination.variant !== rule.variant) return false
    } else {
      if (combination.variant !== 'normal') return false
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'state')) {
      const ruleStatesSet = new Set(['normal', ...(rule.state || [])])
      const combinationSet = new Set(['normal', ...combination.state])
      const setsAreEqual = combination.state.every(state => ruleStatesSet.has(state)) &&
            [...ruleStatesSet].every(state => combinationSet.has(state))
      return setsAreEqual
    } else {
      if (combination.state.length !== 1 || combination.state[0] !== 'normal') return false
      return true
    }
  }

  const findLowerLevelRule = (parent, filter = () => true) => {
    let lowerLevelComponent = null
    let currentParent = parent
    while (currentParent) {
      const rulesParent = ruleset.filter(findRules(currentParent, true))
      rulesParent > 1 && console.log('OOPS')
      lowerLevelComponent = rulesParent[rulesParent.length - 1]
      currentParent = currentParent.parent
      if (lowerLevelComponent && filter(lowerLevelComponent)) currentParent = null
    }
    return filter(lowerLevelComponent) ? lowerLevelComponent : null
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
      const existingRules = ruleset.filter(findRules({ component: component.name, ...combination }))
      const lastRule = existingRules[existingRules.length - 1]

      if (existingRules.length !== 0) {
        const { directives } = lastRule
        const rgb = convert(directives.background).rgb

        // TODO: DEFAULT TEXT COLOR
        const bg = findLowerLevelRule(parent)?.cache.background || convert('#FFFFFF').rgb

        if (!lastRule.cache?.background) {
          const blend = directives.opacity < 1 ? alphaBlend(rgb, directives.opacity, bg) : rgb
          lastRule.cache = lastRule.cache || {}
          lastRule.cache.background = blend

          addRule(lastRule)
        }
      } else {
        if (VIRTUAL_COMPONENTS.has(component.name)) {
          const selector = component.name + ruleToSelector({ component: component.name, ...combination })

          const lowerLevel = findLowerLevelRule(parent, (r) => {
            if (components[r.component].validInnerComponents.indexOf(component.name) < 0) return false
            if (r.cache?.background === undefined) return false
            if (r.cache.textDefined) {
              return !r.cache.textDefined[selector]
            }
            return true
          })
          if (!lowerLevel) return
          lowerLevel.cache.textDefined = lowerLevel.cache.textDefined || {}
          lowerLevel.cache.textDefined[selector] = true
          addRule({
            parent,
            component: component.name,
            ...combination,
            directives: {
              // TODO: DEFAULT TEXT COLOR
              textColor: getTextColor(convert(lowerLevel.cache.background).rgb, convert('#FFFFFF').rgb, component.name === 'Link'),
              // Debug: lets you see what it think background color should be
              background: convert(lowerLevel.cache.background).hex
            }
          })
        }
      }

      innerComponents.forEach(innerComponent => processInnerComponent(innerComponent, { parent, component: name, ...combination }))
    })
  }

  processInnerComponent(components[rootName])

  // console.info(rules.map(x => [
  //   (parent?.component || 'root') + ' -> ' + x.component,
  //   // 'Cached background:' + convert(bg).hex,
  //   // 'Color: ' + convert(x.directives.background).hex + ' A:' + x.directives.opacity,
  //   JSON.stringify(x.directives)
  //   // '=> Blend: ' + convert(x.cache.background).hex
  // ].join(' ')))

  return {
    raw: rules,
    css: rules.map(rule => {
      const header = ruleToSelector(rule) + ' {'
      const footer = '}'
      const directives = Object.entries(rule.directives).map(([k, v]) => {
        switch (k) {
          case 'background': return 'background-color: ' + rgba2css({ ...convert(v).rgb, a: rule.directives.opacity ?? 1 })
          case 'textColor': return 'color: ' + rgba2css({ ...convert(v).rgb, a: rule.directives.opacity ?? 1 })
          default: return ''
        }
      }).filter(x => x).map(x => '  ' + x).join(';\n')
      return [header, directives, footer].join('\n')
    })
  }
}
