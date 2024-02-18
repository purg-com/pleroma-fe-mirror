import { convert, brightness } from 'chromatism'
import {
  alphaBlend,
  getTextColor,
  rgba2css,
  mixrgb,
  relativeLuminance
} from '../color_convert/color_convert.js'

const DEBUG = false

// Ensuring the order of components
const components = {
  Root: null,
  Text: null,
  FunText: null,
  Link: null,
  Icon: null,
  Border: null,
  Panel: null
}

// Loading all style.js[on] files dynamically
const componentsContext = require.context('src', true, /\.style.js(on)?$/)
componentsContext.keys().forEach(key => {
  const component = componentsContext(key).default
  components[component.name] = component
})

// "Unrolls" a tree structure of item: { parent: { ...item2, parent: { ...item3, parent: {...} } }}
// into an array [item2, item3] for iterating
const unroll = (item) => {
  const out = []
  let currentParent = item
  while (currentParent) {
    out.push(currentParent)
    currentParent = currentParent.parent
  }
  return out
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

// Converts rule, parents and their criteria into a CSS (or path if ignoreOutOfTreeSelector == true) selector
export const ruleToSelector = (rule, ignoreOutOfTreeSelector, isParent) => {
  if (!rule && !isParent) return null
  const component = components[rule.component]
  const { states, variants, selector, outOfTreeSelector } = component

  const applicableStates = ((rule.state || []).filter(x => x !== 'normal')).map(state => states[state])

  const applicableVariantName = (rule.variant || 'normal')
  let applicableVariant = ''
  if (applicableVariantName !== 'normal') {
    applicableVariant = variants[applicableVariantName]
  } else {
    applicableVariant = variants?.normal ?? ''
  }

  let realSelector
  if (selector === ':root') {
    realSelector = ''
  } else if (isParent) {
    realSelector = selector
  } else {
    if (outOfTreeSelector && !ignoreOutOfTreeSelector) realSelector = outOfTreeSelector
    else realSelector = selector
  }

  const selectors = [realSelector, applicableVariant, ...applicableStates]
    .toSorted((a, b) => {
      if (a.startsWith(':')) return 1
      if (/^[a-z]/.exec(a)) return -1
      else return 0
    })
    .join('')

  if (rule.parent) {
    return (ruleToSelector(rule.parent, ignoreOutOfTreeSelector, true) + ' ' + selectors).trim()
  }
  return selectors.trim()
}

const combinationsMatch = (criteria, subject, strict) => {
  if (criteria.component !== subject.component) return false

  // All variants inherit from normal
  if (subject.variant !== 'normal' || strict) {
    if (criteria.variant !== subject.variant) return false
  }

  // Subject states > 1 essentially means state is "normal" and therefore matches
  if (subject.state.length > 1 || strict) {
    const subjectStatesSet = new Set(subject.state)
    const criteriaStatesSet = new Set(criteria.state)

    const setsAreEqual =
      [...criteriaStatesSet].every(state => subjectStatesSet.has(state)) &&
      [...subjectStatesSet].every(state => criteriaStatesSet.has(state))

    if (!setsAreEqual) return false
  }
  return true
}

const findRules = (criteria, strict) => subject => {
  // If we searching for "general" rules - ignore "specific" ones
  if (criteria.parent === null && !!subject.parent) return false
  if (!combinationsMatch(criteria, subject, strict)) return false

  if (criteria.parent !== undefined && criteria.parent !== null) {
    if (!subject.parent && !strict) return true
    const pathCriteria = unroll(criteria)
    const pathSubject = unroll(subject)
    if (pathCriteria.length < pathSubject.length) return false

    // Search: .a .b .c
    // Matches: .a .b .c; .b .c; .c; .z .a .b .c
    // Does not match .a .b .c .d, .a .b .e
    for (let i = 0; i < pathCriteria.length; i++) {
      const criteriaParent = pathCriteria[i]
      const subjectParent = pathSubject[i]
      if (!subjectParent) return true
      if (!combinationsMatch(criteriaParent, subjectParent, strict)) return false
    }
  }
  return true
}

export const init = (extraRuleset, palette) => {
  const stacked = {}
  const computed = {}

  const eagerRules = []
  const lazyRules = []

  const normalizeCombination = rule => {
    rule.variant = rule.variant ?? 'normal'
    rule.state = [...new Set(['normal', ...(rule.state || [])])]
  }

  const rulesetUnsorted = [
    ...Object.values(components)
      .map(c => (c.defaultRules || []).map(r => ({ component: c.name, ...r })))
      .reduce((acc, arr) => [...acc, ...arr], []),
    ...extraRuleset
  ].map(rule => {
    normalizeCombination(rule)
    let currentParent = rule.parent
    while (currentParent) {
      normalizeCombination(currentParent)
      currentParent = currentParent.parent
    }

    return rule
  })
  console.log(rulesetUnsorted)

  const ruleset = rulesetUnsorted
    .map((data, index) => ({ data, index }))
    .sort(({ data: a, index: ai }, { data: b, index: bi }) => {
      const parentsA = unroll(a).length
      const parentsB = unroll(b).length

      if (parentsA === parentsB) {
        if (a.component === 'Text') return -1
        if (b.component === 'Text') return 1
        return ai - bi
      }
      if (parentsA === 0 && parentsB !== 0) return -1
      if (parentsB === 0 && parentsA !== 0) return 1
      return parentsA - parentsB
    })
    .map(({ data }) => data)

  console.log(ruleset.filter(c => c.component === 'ButtonUnstyled'))

  const virtualComponents = new Set(Object.values(components).filter(c => c.virtual).map(c => c.name))

  const findColor = (color, dynamicVars) => {
    if (typeof color !== 'string' || (!color.startsWith('--') && !color.startsWith('$'))) return color
    let targetColor = null
    if (color.startsWith('--')) {
      const [variable, modifier] = color.split(/,/g).map(str => str.trim())
      const variableSlot = variable.substring(2)
      if (variableSlot === 'stack') {
        const { r, g, b } = dynamicVars.stacked
        targetColor = { r, g, b }
      } else if (variableSlot.startsWith('parent')) {
        if (variableSlot === 'parent') {
          const { r, g, b } = dynamicVars.lowerLevelBackground
          targetColor = { r, g, b }
        } else {
          const virtualSlot = variableSlot.replace(/^parent/, '')
          targetColor = convert(dynamicVars.lowerLevelVirtualDirectivesRaw[virtualSlot]).rgb
        }
      } else {
        // TODO add support for --current prefix
        switch (variableSlot) {
          case 'inheritedBackground':
            targetColor = convert(dynamicVars.inheritedBackground).rgb
            break
          case 'background':
            targetColor = convert(dynamicVars.background).rgb
            break
          default:
            targetColor = convert(palette[variableSlot]).rgb
        }
      }

      if (modifier) {
        const effectiveBackground = dynamicVars.lowerLevelBackground ?? targetColor
        const isLightOnDark = relativeLuminance(convert(effectiveBackground).rgb) < 0.5
        const mod = isLightOnDark ? 1 : -1
        targetColor = brightness(Number.parseFloat(modifier) * mod, targetColor).rgb
      }
    }

    if (color.startsWith('$')) {
      try {
        const { funcName, argsString } = /\$(?<funcName>\w+)\((?<argsString>[a-zA-Z0-9-,.'"\s]*)\)/.exec(color).groups
        const args = argsString.split(/,/g).map(a => a.trim())
        switch (funcName) {
          case 'alpha': {
            if (args.length !== 2) {
              throw new Error(`$alpha requires 2 arguments, ${args.length} were provided`)
            }
            const colorArg = convert(findColor(args[0], dynamicVars)).rgb
            const amount = Number(args[1])
            targetColor = { ...colorArg, a: amount }
            break
          }
          case 'blend': {
            if (args.length !== 3) {
              throw new Error(`$blend requires 3 arguments, ${args.length} were provided`)
            }
            const backgroundArg = convert(findColor(args[2], dynamicVars)).rgb
            const foregroundArg = convert(findColor(args[0], dynamicVars)).rgb
            const amount = Number(args[1])
            targetColor = alphaBlend(backgroundArg, amount, foregroundArg)
            break
          }
          case 'mod': {
            if (args.length !== 2) {
              throw new Error(`$mod requires 2 arguments, ${args.length} were provided`)
            }
            const color = convert(findColor(args[0], dynamicVars)).rgb
            const amount = Number(args[1])
            const effectiveBackground = dynamicVars.lowerLevelBackground
            const isLightOnDark = relativeLuminance(convert(effectiveBackground).rgb) < 0.5
            const mod = isLightOnDark ? 1 : -1
            targetColor = brightness(amount * mod, color).rgb
            break
          }
        }
      } catch (e) {
        console.error('Failure executing color function', e)
        targetColor = '#FF00FF'
      }
    }
    // Color references other color
    return targetColor
  }

  const cssColorString = (color, alpha) => rgba2css({ ...convert(color).rgb, a: alpha })

  const getTextColorAlpha = (directives, intendedTextColor, dynamicVars) => {
    const opacity = directives.textOpacity
    const backgroundColor = convert(dynamicVars.lowerLevelBackground).rgb
    const textColor = convert(findColor(intendedTextColor, dynamicVars)).rgb
    if (opacity === null || opacity === undefined || opacity >= 1) {
      return convert(textColor).hex
    }
    if (opacity === 0) {
      return convert(backgroundColor).hex
    }
    const opacityMode = directives.textOpacityMode
    switch (opacityMode) {
      case 'fake':
        return convert(alphaBlend(textColor, opacity, backgroundColor)).hex
      case 'mixrgb':
        return convert(mixrgb(backgroundColor, textColor)).hex
      default:
        return rgba2css({ a: opacity, ...textColor })
    }
  }

  const getCssShadow = (input, usesDropShadow) => {
    if (input.length === 0) {
      return 'none'
    }

    return input
      .filter(_ => usesDropShadow ? _.inset : _)
      .map((shad) => [
        shad.x,
        shad.y,
        shad.blur,
        shad.spread
      ].map(_ => _ + 'px ').concat([
        cssColorString(findColor(shad.color), shad.alpha),
        shad.inset ? 'inset' : ''
      ]).join(' ')).join(', ')
  }

  const getCssShadowFilter = (input) => {
    if (input.length === 0) {
      return 'none'
    }

    return input
    // drop-shadow doesn't support inset or spread
      .filter((shad) => !shad.inset && Number(shad.spread) === 0)
      .map((shad) => [
        shad.x,
        shad.y,
        // drop-shadow's blur is twice as strong compared to box-shadow
        shad.blur / 2
      ].map(_ => _ + 'px').concat([
        cssColorString(findColor(shad.color), shad.alpha)
      ]).join(' '))
      .map(_ => `drop-shadow(${_})`)
      .join(' ')
  }

  let counter = 0
  const promises = []
  const processInnerComponent = (component, rules, parent) => {
    const addRule = (rule) => {
      rules.push(rule)
    }

    const parentSelector = ruleToSelector(parent, true)
    // const parentList = parent ? unroll(parent).reverse().map(c => c.component) : []
    // if (!component.virtual) {
    //   const path = [...parentList, component.name].join(' > ')
    //   console.log('Component ' + path + ' process starting')
    // }
    // const t0 = performance.now()
    const {
      validInnerComponents = [],
      states: originalStates = {},
      variants: originalVariants = {},
      name
    } = component

    // Normalizing states and variants to always include "normal"
    const states = { normal: '', ...originalStates }
    const variants = { normal: '', ...originalVariants }
    const innerComponents = (validInnerComponents).map(name => {
      const result = components[name]
      if (result === undefined) console.error(`Component ${component.name} references a component ${name} which does not exist!`)
      return result
    })

    // Optimization: we only really need combinations without "normal" because all states implicitly have it
    const permutationStateKeys = Object.keys(states).filter(s => s !== 'normal')
    const stateCombinations = [
      ['normal'],
      ...getAllPossibleCombinations(permutationStateKeys)
        .map(combination => ['normal', ...combination])
        .filter(combo => {
          // Optimization: filter out some hard-coded combinations that don't make sense
          if (combo.indexOf('disabled') >= 0) {
            return !(
              combo.indexOf('hover') >= 0 ||
                combo.indexOf('focused') >= 0 ||
                combo.indexOf('pressed') >= 0
            )
          }
          return true
        })
    ]

    const stateVariantCombination = Object.keys(variants).map(variant => {
      return stateCombinations.map(state => ({ variant, state }))
    }).reduce((acc, x) => [...acc, ...x], [])

    stateVariantCombination.forEach(combination => {
      counter++
      // const tt0 = performance.now()

      combination.component = component.name
      const soloSelector = ruleToSelector(combination, true)
      const soloCssSelector = ruleToSelector(combination)
      const selector = [parentSelector, soloSelector].filter(x => x).join(' ')
      const cssSelector = [parentSelector, soloCssSelector].filter(x => x).join(' ')

      const lowerLevelSelector = parentSelector
      const lowerLevelBackground = computed[lowerLevelSelector]?.background
      const lowerLevelVirtualDirectives = computed[lowerLevelSelector]?.virtualDirectives
      const lowerLevelVirtualDirectivesRaw = computed[lowerLevelSelector]?.virtualDirectivesRaw

      const dynamicVars = {
        lowerLevelBackground,
        lowerLevelVirtualDirectives,
        lowerLevelVirtualDirectivesRaw
      }

      // Inheriting all of the applicable rules
      const existingRules = ruleset.filter(findRules({ component: component.name, ...combination, parent }))
      const computedDirectives = existingRules.map(r => r.directives).reduce((acc, directives) => ({ ...acc, ...directives }), {})
      const computedRule = {
        component: component.name,
        ...combination,
        parent,
        directives: computedDirectives
      }

      computed[selector] = computed[selector] || {}
      computed[selector].computedRule = computedRule
      computed[selector].dynamicVars = dynamicVars

      if (virtualComponents.has(component.name)) {
        const virtualName = [
          '--',
          component.name.toLowerCase(),
          combination.variant === 'normal'
            ? ''
            : combination.variant[0].toUpperCase() + combination.variant.slice(1).toLowerCase(),
          ...combination.state.filter(x => x !== 'normal').toSorted().map(state => state[0].toUpperCase() + state.slice(1).toLowerCase())
        ].join('')

        let inheritedTextColor = computedDirectives.textColor
        let inheritedTextAuto = computedDirectives.textAuto
        let inheritedTextOpacity = computedDirectives.textOpacity
        let inheritedTextOpacityMode = computedDirectives.textOpacityMode
        const lowerLevelTextSelector = [...selector.split(/ /g).slice(0, -1), soloSelector].join(' ')
        const lowerLevelTextRule = computed[lowerLevelTextSelector]

        if (inheritedTextColor == null || inheritedTextOpacity == null || inheritedTextOpacityMode == null) {
          inheritedTextColor = computedDirectives.textColor ?? lowerLevelTextRule.textColor
          inheritedTextAuto = computedDirectives.textAuto ?? lowerLevelTextRule.textAuto
          inheritedTextOpacity = computedDirectives.textOpacity ?? lowerLevelTextRule.textOpacity
          inheritedTextOpacityMode = computedDirectives.textOpacityMode ?? lowerLevelTextRule.textOpacityMode
        }

        const newTextRule = {
          ...computedRule,
          directives: {
            ...computedRule.directives,
            textColor: inheritedTextColor,
            textAuto: inheritedTextAuto ?? 'preserve',
            textOpacity: inheritedTextOpacity,
            textOpacityMode: inheritedTextOpacityMode
          }
        }

        dynamicVars.inheritedBackground = lowerLevelBackground
        dynamicVars.stacked = convert(stacked[lowerLevelSelector]).rgb

        const intendedTextColor = convert(findColor(inheritedTextColor, dynamicVars)).rgb
        const textColor = newTextRule.directives.textAuto === 'no-auto'
          ? intendedTextColor
          : getTextColor(
            convert(stacked[lowerLevelSelector]).rgb,
            intendedTextColor,
            newTextRule.directives.textAuto === 'preserve'
          )

        // Updating previously added rule
        const earlyLowerLevelRules = rules.filter(findRules(parent, true))
        const earlyLowerLevelRule = earlyLowerLevelRules.slice(-1)[0]

        const virtualDirectives = earlyLowerLevelRule.virtualDirectives || {}
        const virtualDirectivesRaw = earlyLowerLevelRule.virtualDirectivesRaw || {}

        // Storing color data in lower layer to use as custom css properties
        virtualDirectives[virtualName] = getTextColorAlpha(newTextRule.directives, textColor, dynamicVars)
        virtualDirectivesRaw[virtualName] = textColor
        earlyLowerLevelRule.virtualDirectives = virtualDirectives
        earlyLowerLevelRule.virtualDirectivesRaw = virtualDirectivesRaw
        computed[lowerLevelSelector].virtualDirectives = virtualDirectives
        computed[lowerLevelSelector].virtualDirectivesRaw = virtualDirectivesRaw

        // Debug: lets you see what it think background color should be
        if (!DEBUG) return

        const directives = {
          textColor,
          background: convert(computed[lowerLevelSelector].background).hex,
          ...inheritedTextOpacity
        }

        addRule({
          selector: cssSelector,
          virtual: true,
          component: component.name,
          parent,
          ...combination,
          directives,
          virtualDirectives,
          virtualDirectivesRaw
        })
      } else {
        computed[selector] = computed[selector] || {}
        let addRuleNeeded = false

        // TODO: DEFAULT TEXT COLOR
        const lowerLevelStackedBackground = stacked[lowerLevelSelector] || convert('#FF00FF').rgb

        if (computedDirectives.shadow != null || computedDirectives.roundness != null) {
          addRuleNeeded = true
        }

        if (computedDirectives.background) {
          addRuleNeeded = true
          let inheritRule = null
          const variantRules = ruleset.filter(findRules({ component: component.name, variant: combination.variant, parent }))
          const lastVariantRule = variantRules[variantRules.length - 1]
          if (lastVariantRule) {
            inheritRule = lastVariantRule
          } else {
            const normalRules = ruleset.filter(findRules({ component: component.name, parent }))
            const lastNormalRule = normalRules[normalRules.length - 1]
            inheritRule = lastNormalRule
          }

          const inheritSelector = ruleToSelector({ ...inheritRule, parent }, true)
          const inheritedBackground = computed[inheritSelector].background

          dynamicVars.inheritedBackground = inheritedBackground

          const rgb = convert(findColor(computedDirectives.background, dynamicVars)).rgb

          if (!stacked[selector]) {
            let blend
            const alpha = computedDirectives.opacity
            if (alpha >= 1) {
              blend = rgb
            } else if (alpha <= 0) {
              blend = lowerLevelStackedBackground
            } else {
              blend = alphaBlend(rgb, computedDirectives.opacity, lowerLevelStackedBackground)
            }
            stacked[selector] = blend
            dynamicVars.stacked = blend
            computed[selector].background = { ...rgb, a: computedDirectives.opacity ?? 1 }
          }
        }

        if (!stacked[selector]) {
          computedDirectives.background = 'transparent'
          computedDirectives.opacity = 0
          stacked[selector] = lowerLevelStackedBackground
          computed[selector].background = { ...lowerLevelStackedBackground, a: 0 }
        }

        dynamicVars.stacked = lowerLevelStackedBackground
        dynamicVars.background = computed[selector].background

        if (addRuleNeeded) {
          addRule({
            selector: cssSelector,
            component: component.name,
            ...combination,
            parent,
            directives: computedDirectives
          })
        }
      }

      innerComponents.forEach(innerComponent => {
        if (innerComponent.lazy) {
          promises.push(new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                processInnerComponent(innerComponent, lazyRules, { parent, component: name, ...combination })
                resolve()
              } catch (e) {
                reject(e)
              }
            }, 0)
          }))
        } else {
          processInnerComponent(innerComponent, rules, { parent, component: name, ...combination })
        }
      })
      // const tt1 = performance.now()
      // if (!component.virtual) {
      //   console.log('State-variant ' + combination.variant + ' : ' + combination.state.join('+') + ' procession time: ' + (tt1 - tt0) + 'ms')
      // }
    })

    // const t1 = performance.now()
    // if (!component.virtual) {
    //   const path = [...parentList, component.name].join(' > ')
    //   console.log('Component ' + path + ' procession time: ' + (t1 - t0) + 'ms')
    // }
  }

  processInnerComponent(components.Root, eagerRules)
  console.log('TOTAL COMBOS: ' + counter)
  const lazyExec = Promise.all(promises).then(() => {
    console.log('TOTAL COMBOS: ' + counter)
  }).then(() => lazyRules)

  return {
    lazy: lazyExec,
    eager: eagerRules,
    css: rules => rules.map(rule => {
      let selector = rule.selector
      if (!selector) {
        selector = 'body'
      }
      const header = selector + ' {'
      const footer = '}'

      const virtualDirectives = Object.entries(rule.virtualDirectives || {}).map(([k, v]) => {
        return '  ' + k + ': ' + v
      }).join(';\n')

      let directives
      if (rule.component !== 'Root') {
        directives = Object.entries(rule.directives).map(([k, v]) => {
          const selector = ruleToSelector(rule, true)
          switch (k) {
            case 'roundness': {
              return '  ' + [
                '--roundness: ' + v + 'px'
              ].join(';\n  ')
            }
            case 'shadow': {
              return '  ' + [
                '--shadow: ' + getCssShadow(v),
                '--shadowFilter: ' + getCssShadowFilter(v),
                '--shadowInset: ' + getCssShadow(v, true)
              ].join(';\n  ')
            }
            case 'background': {
              if (v === 'transparent') {
                return [
                  'background-color: ' + v,
                  '  --background: ' + v
                ].join(';\n')
              }
              const color = cssColorString(computed[selector].background, rule.directives.opacity)
              return [
                'background-color: ' + color,
                '  --background: ' + color
              ].join(';\n')
            }
            case 'textColor': {
              if (rule.directives.textNoCssColor === 'yes') { return '' }
              return 'color: ' + v
            }
            default:
              if (k.startsWith('--')) {
                return k + ': ' + rgba2css(findColor(v, computed[selector].dynamicVars))
              }
              return ''
          }
        }).filter(x => x).map(x => '  ' + x).join(';\n')
      } else {
        directives = {}
      }

      return [
        header,
        directives + ';',
        (!rule.virtual && rule.directives.textNoCssColor !== 'yes') ? '  color: var(--text);' : '',
        '',
        virtualDirectives,
        footer
      ].join('\n')
    }).filter(x => x)
  }
}
