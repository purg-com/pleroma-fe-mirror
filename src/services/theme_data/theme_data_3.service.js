import Underlay from 'src/components/underlay.style.js'
import Panel from 'src/components/panel.style.js'
import Button from 'src/components/button.style.js'
import Text from 'src/components/text.style.js'
import Icon from 'src/components/icon.style.js'

const root = Underlay
const components = {
  Underlay,
  Panel,
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

  const applicableStates = (rule.state.filter(x => x !== 'normal') || []).map(state => states[state])

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
    rulesByComponent.push(rule)
  }

  ruleset.forEach(rule => {

  })

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

    stateVariantCombination.forEach(combination => {
      // addRule(({
      //   parent,
      //   component: component.name,
      //   state: combination.state,
      //   variant: combination.variant
      // }))

      innerComponents.forEach(innerComponent => processInnerComponent(innerComponent, { parent, component: name, ...combination }))
    })
  }

  processInnerComponent(components[rootName])
  return rules
}
