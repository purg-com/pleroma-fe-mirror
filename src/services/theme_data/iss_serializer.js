import { unroll } from './iss_utils'

const getCanonicState = (state) => {
  if (state) {
    return ['normal', ...state.filter(x => x !== 'normal')]
  } else {
    return ['normal']
  }
}

const getCanonicRuleHeader = ({
  component,
  variant = 'normal',
  parent,
  state
}) => ({
  component,
  variant,
  parent,
  state: getCanonicState(state)
})

const prepareRule = (rule) => {
  const { parent } = rule
  const chain = [...unroll(parent), rule].map(getCanonicRuleHeader)
  const header = chain.map(({ component, variant, state }) => [
    component,
    variant === 'normal' ? '' : ('.' + variant),
    state.filter(s => s !== 'normal').map(s => ':' + s).join('')
  ].join('')).join(' ')

  console.log(header, rule.directives)
  const content = Object.entries(rule.directives).map(([key, value]) => {
    let realValue = value

    switch (key) {
      case 'shadow':
        realValue = realValue.map(v => `${v.inset ? 'inset ' : ''}${v.x} ${v.y} ${v.blur} ${v.spread} ${v.color} / ${v.alpha}`)
    }

    if (Array.isArray(realValue)) {
      realValue = realValue.join(', ')
    }

    return `  ${key}: ${realValue};`
  }).sort().join('\n')

  return [
    header,
    content
  ]
}

export const serialize = (ruleset) => {
  // Scrapped idea: automatically combine same-set directives
  // problem: might violate the order rules

  return ruleset.filter(r => Object.keys(r.directives).length > 0).map(r => {
    const [header, content] = prepareRule(r)
    return `${header} {\n${content}\n}\n\n`
  })
}
