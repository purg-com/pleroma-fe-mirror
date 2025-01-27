import { invertLightness, contrastRatio, convert } from 'chromatism'

// useful for visualizing color when debugging
export const consoleColor = (color) => console.log('%c##########', 'background: ' + color + '; color: ' + color)

/**
 * Convert r, g, b values into hex notation. All components are [0-255]
 *
 * @param {Number|String|Object} r - Either red component, {r,g,b} object, or hex string
 * @param {Number} [g] - Green component
 * @param {Number} [b] - Blue component
 */
export const rgb2hex = (r, g, b) => {
  if (r === null || typeof r === 'undefined') {
    return undefined
  }
  // TODO: clean up this mess
  if (r[0] === '#' || r === 'transparent') {
    return r
  }
  if (typeof r === 'object') {
    ({ r, g, b } = r)
  }
  [r, g, b] = [r, g, b].map(val => {
    val = Math.ceil(val)
    val = val < 0 ? 0 : val
    val = val > 255 ? 255 : val
    return val
  })
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Converts 8-bit RGB component into linear component
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/relative-luminance.xml
 * https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
 *
 * @param {Number} bit - color component [0..255]
 * @returns {Number} linear component [0..1]
 */
const c2linear = (bit) => {
  // W3C gives 0.03928 while wikipedia states 0.04045
  // what those magical numbers mean - I don't know.
  // something about gamma-correction, i suppose.
  // Sticking with W3C example.
  const c = bit / 255
  if (c < 0.03928) {
    return c / 12.92
  } else {
    return Math.pow((c + 0.055) / 1.055, 2.4)
  }
}

/**
 * Calculates relative luminance for given color
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/relative-luminance.xml
 *
 * @param {Object} srgb - sRGB color
 * @returns {Number} relative luminance
 */
export const relativeLuminance = (srgb) => {
  const r = c2linear(srgb.r)
  const g = c2linear(srgb.g)
  const b = c2linear(srgb.b)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Generates color ratio between two colors. Order is unimporant
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 *
 * @param {Object} a - sRGB color
 * @param {Object} b - sRGB color
 * @returns {Number} color ratio
 */
export const getContrastRatio = (a, b) => {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [l1, l2] = la > lb ? [la, lb] : [lb, la]

  return (l1 + 0.05) / (l2 + 0.05)
}

/**
 * Same as `getContrastRatio` but for multiple layers in-between
 *
 * @param {Object} text - text color (topmost layer)
 * @param {[Object, Number]} layers[] - layers between text and bedrock
 * @param {Object} bedrock - layer at the very bottom
 */
export const getContrastRatioLayers = (text, layers, bedrock) => {
  return getContrastRatio(alphaBlendLayers(bedrock, layers), text)
}

/**
 * This performs alpha blending between solid background and semi-transparent foreground
 *
 * @param {Object} fg - top layer color
 * @param {Number} fga - top layer's alpha
 * @param {Object} bg - bottom layer color
 * @returns {Object} sRGB of resulting color
 */
export const alphaBlend = (fg, fga, bg) => {
  if (fga === 1 || typeof fga === 'undefined') {
    return fg
  }

  // Simplified https://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
  // for opaque bg and transparent fg
  return {
    r: (fg.r * fga + bg.r * (1 - fga)),
    g: (fg.g * fga + bg.g * (1 - fga)),
    b: (fg.b * fga + bg.b * (1 - fga))
  }
}

/**
 * Same as `alphaBlend` but for multiple layers in-between
 *
 * @param {Object} bedrock - layer at the very bottom
 * @param {[Object, Number]} layers[] - layers between text and bedrock
 */
export const alphaBlendLayers = (bedrock, layers) => layers.reduce((acc, [color, opacity]) => {
  return alphaBlend(color, opacity, acc)
}, bedrock)

export const invert = (rgb) => {
  return {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  }
}

/**
 * Converts #rrggbb hex notation into an {r, g, b} object
 *
 * @param {String} hex - #rrggbb string
 * @returns {Object} rgb representation of the color, values are 0-255
 */
export const hex2rgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * Old somewhat weird function for mixing two colors together
 *
 * @param {Object} a - one color (rgb)
 * @param {Object} b - other color (rgb)
 * @returns {Object} result
 */
export const mixrgb = (a, b) => {
  return {
    r: (a.r + b.r) / 2,
    g: (a.g + b.g) / 2,
    b: (a.b + b.b) / 2
  }
}

/**
 * Converts rgb object into a CSS rgba() color
 *
 * @param {Object} color - rgb
 * @returns {String} CSS rgba() color
 */
export const rgba2css = function (rgba) {
  const base = {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  }

  if (rgba !== null) {
    if (rgba.r !== undefined && !isNaN(rgba.r)) {
      base.r = rgba.r
    }
    if (rgba.g !== undefined && !isNaN(rgba.g)) {
      base.g = rgba.g
    }
    if (rgba.b !== undefined && !isNaN(rgba.b)) {
      base.b = rgba.b
    }
    if (rgba.a !== undefined && !isNaN(rgba.a)) {
      base.a = rgba.a
    }
  } else {
    base.r = 255
    base.g = 255
    base.b = 255
  }

  return `rgba(${Math.floor(base.r)}, ${Math.floor(base.g)}, ${Math.floor(base.b)}, ${base.a})`
}

/**
 * Get text color for given background color and intended text color
 * This checks if text and background don't have enough color and inverts
 * text color's lightness if needed. If text color is still not enough it
 * will fall back to black or white
 *
 * @param {Object} bg - background color
 * @param {Object} text - intended text color
 * @param {Boolean} preserve - try to preserve intended text color's hue/saturation (i.e. no BW)
 */
export const getTextColor = function (bg, text, preserve) {
  const originalContrast = getContrastRatio(bg, text)
  if (!preserve) {
    if (originalContrast < 4.5) {
      // B&W
      return contrastRatio(bg, text).rgb
    }
  }

  const originalColor = convert(text).hex
  const invertedColor = invertLightness(originalColor).hex
  const invertedContrast = getContrastRatio(bg, convert(invertedColor).rgb)
  let workColor

  if (invertedContrast > originalContrast) {
    workColor = invertedColor
  } else {
    workColor = originalColor
  }

  let contrast = getContrastRatio(bg, text)
  const result = convert(rgb2hex(workColor)).hsl
  const delta = result.l >= 50 ? 1 : -1
  const multiplier = 1
  while (contrast < 4.5 && result.l > 20 && result.l < 80) {
    result.l += delta * multiplier
    result.l = Math.min(100, Math.max(0, result.l))
    contrast = getContrastRatio(bg, convert(result).rgb)
  }

  const base = typeof text.a !== 'undefined' ? { a: text.a } : {}
  return Object.assign(convert(result).rgb, base)
}

/**
 * Converts color to CSS Color value
 *
 * @param {Object|String} input - color
 * @param {Number} [a] - alpha value
 * @returns {String} a CSS Color value
 */
export const getCssColor = (input, a) => {
  let rgb = {}
  if (typeof input === 'object') {
    rgb = input
  } else if (typeof input === 'string') {
    if (input.startsWith('#')) {
      rgb = hex2rgb(input)
    } else {
      return input
    }
  }
  return rgba2css({ ...rgb, a })
}
