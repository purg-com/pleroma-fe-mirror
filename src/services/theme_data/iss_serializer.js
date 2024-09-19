import { unroll } from './iss_utils.js'

const serializeShadow = s => `{${s.inset ? 'inset ' : ''}${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color} / ${s.alpha}}`

export const serialize = (ruleset) => {
  return ruleset.map((rule) => {
    if (Object.keys(rule.directives || {}).length === 0) return false

    const header = unroll(rule).reverse().map(rule => {
      const { component } = rule
      const newVariant = rule.variant === 'normal' ? '' : ('.' + rule.variant)
      const newState = rule.state.filter(st => st !== 'normal')

      return `${component}${newVariant}${newState.map(st => ':' + st).join('')}`
    }).join(' ')

    const content = Object.entries(rule.directives).map(([directive, value]) => {
      if (directive.startsWith('--')) {
        const [valType, newValue] = value.split('|') // only first one! intentional!
        switch (valType) {
          case 'shadow':
            return `  ${directive}: ${newValue.map(serializeShadow).join(', ')}`
          default:
            return `  ${directive}: ${newValue}`
        }
      } else {
        switch (directive) {
          case 'shadow':
            return `  ${directive}: ${value.map(serializeShadow).join(', ')}`
          default:
            return `  ${directive}: ${value}`
        }
      }
    })

    return `${header} {\n${content.join(';\n')}\n}`
  }).filter(x => x).join('\n\n')
}
