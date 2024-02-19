import { convert } from 'chromatism'

import { rgba2css } from '../color_convert/color_convert.js'

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
