import { convert } from 'chromatism'

import { rgba2css } from '../color_convert/color_convert.js'

export const parseCssShadow = (text) => {
  const dimensions = /(\d[a-z]*\s?){2,4}/.exec(text)?.[0]
  const inset = /inset/.exec(text)?.[0]
  const color = text.replace(dimensions, '').replace(inset, '')

  const [x, y, blur = 0, spread = 0] = dimensions.split(/ /).filter(x => x).map(x => x.trim())
  const isInset = inset?.trim() === 'inset'
  console.log(color.trim())
  const colorString = color.split(/ /).filter(x => x).map(x => x.trim())[0]

  return {
    x,
    y,
    blur,
    spread,
    inset: isInset,
    color: colorString
  }
}

export const getCssColorString = (color, alpha) => rgba2css({ ...convert(color).rgb, a: alpha })

export const getCssShadow = (input, usesDropShadow) => {
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
      getCssColorString(shad.color, shad.alpha),
      shad.inset ? 'inset' : ''
    ]).join(' ')).join(', ')
}

export const getCssShadowFilter = (input) => {
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
      getCssColorString(shad.color, shad.alpha)
    ]).join(' '))
    .map(_ => `drop-shadow(${_})`)
    .join(' ')
}

export const getCssRules = (rules) => rules.map(rule => {
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
      switch (k) {
        case 'roundness': {
          return '  ' + [
            '--roundness: ' + v + 'px'
          ].join(';\n  ')
        }
        case 'shadow': {
          return '  ' + [
            '--shadow: ' + getCssShadow(rule.dynamicVars.shadow),
            '--shadowFilter: ' + getCssShadowFilter(rule.dynamicVars.shadow),
            '--shadowInset: ' + getCssShadow(rule.dynamicVars.shadow, true)
          ].join(';\n  ')
        }
        case 'background': {
          if (v === 'transparent') {
            return [
              rule.directives.backgroundNoCssColor !== 'yes' ? ('background-color: ' + v) : '',
              '  --background: ' + v
            ].filter(x => x).join(';\n')
          }
          const color = getCssColorString(rule.dynamicVars.background, rule.directives.opacity)
          return [
            rule.directives.backgroundNoCssColor !== 'yes' ? ('background-color: ' + color) : '',
            '  --background: ' + color
          ].filter(x => x).join(';\n')
        }
        case 'textColor': {
          if (rule.directives.textNoCssColor === 'yes') { return '' }
          return 'color: ' + v
        }
        default:
          if (k.startsWith('--')) {
            const [type] = v.split('|').map(x => x.trim()) // woah, Extreme!
            switch (type) {
              case 'color':
                return k + ': ' + rgba2css(rule.dynamicVars[k])
              default:
                return ''
            }
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
