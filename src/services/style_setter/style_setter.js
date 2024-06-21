import { hex2rgb } from '../color_convert/color_convert.js'
import { generatePreset } from '../theme_data/theme_data.service.js'
import { init, getEngineChecksum } from '../theme_data/theme_data_3.service.js'
import { convertTheme2To3 } from '../theme_data/theme2_to_theme3.js'
import { getCssRules } from '../theme_data/css_utils.js'
import { defaultState } from '../../modules/config.js'
import { chunk } from 'lodash'

// On platforms where this is not supported, it will return undefined
// Otherwise it will return an array
const supportsAdoptedStyleSheets = !!document.adoptedStyleSheets

const createStyleSheet = (id) => {
  if (supportsAdoptedStyleSheets) {
    return {
      el: null,
      sheet: new CSSStyleSheet(),
      rules: []
    }
  }

  const el = document.getElementById(id)
  // Clear all rules in it
  for (let i = el.sheet.cssRules.length - 1; i >= 0; --i) {
    el.sheet.deleteRule(i)
  }

  return {
    el,
    sheet: el.sheet,
    rules: []
  }
}

const EAGER_STYLE_ID = 'pleroma-eager-styles'
const LAZY_STYLE_ID = 'pleroma-lazy-styles'

const adoptStyleSheets = (styles) => {
  if (supportsAdoptedStyleSheets) {
    document.adoptedStyleSheets = styles.map(s => s.sheet)
  }
  // Some older browsers do not support document.adoptedStyleSheets.
  // In this case, we use the <style> elements.
  // Since the <style> elements we need are already in the DOM, there
  // is nothing to do here.
}

export const generateTheme = async (input, callbacks, debug) => {
  const {
    onNewRule = (rule, isLazy) => {},
    onLazyFinished = () => {},
    onEagerFinished = () => {}
  } = callbacks

  let extraRules
  if (input.themeFileVersion === 1) {
    extraRules = convertTheme2To3(input)
  } else {
    const { theme } = generatePreset(input)
    extraRules = convertTheme2To3(theme)
  }

  // Assuming that "worst case scenario background" is panel background since it's the most likely one
  const themes3 = init(extraRules, extraRules[0].directives['--bg'].split('|')[1].trim(), debug)

  console.log('DEBUG 2 IS', debug)

  getCssRules(themes3.eager, debug).forEach(rule => {
    // Hacks to support multiple selectors on same component
    if (rule.match(/::-webkit-scrollbar-button/)) {
      const parts = rule.split(/[{}]/g)
      const newRule = [
        parts[0],
        ', ',
        parts[0].replace(/button/, 'thumb'),
        ', ',
        parts[0].replace(/scrollbar-button/, 'resizer'),
        ' {',
        parts[1],
        '}'
      ].join('')
      onNewRule(newRule, false)
    } else {
      onNewRule(rule, false)
    }
  })
  onEagerFinished()

  // Optimization - instead of processing all lazy rules in one go, process them in small chunks
  // so that UI can do other things and be somewhat responsive while less important rules are being
  // processed
  let counter = 0
  const chunks = chunk(themes3.lazy, 200)
  // let t0 = performance.now()
  const processChunk = () => {
    const chunk = chunks[counter]
    Promise.all(chunk.map(x => x())).then(result => {
      getCssRules(result.filter(x => x), debug).forEach(rule => {
        if (rule.match(/\.modal-view/)) {
          const parts = rule.split(/[{}]/g)
          const newRule = [
            parts[0],
            ', ',
            parts[0].replace(/\.modal-view/, '#modal'),
            ', ',
            parts[0].replace(/\.modal-view/, '.shout-panel'),
            ' {',
            parts[1],
            '}'
          ].join('')
          onNewRule(newRule, true)
        } else {
          onNewRule(rule, true)
        }
      })
      // const t1 = performance.now()
      // console.debug('Chunk ' + counter + ' took ' + (t1 - t0) + 'ms')
      // t0 = t1
      counter += 1
      if (counter < chunks.length) {
        setTimeout(processChunk, 0)
      } else {
        onLazyFinished()
      }
    })
  }

  return { lazyProcessFunc: processChunk }
}

export const tryLoadCache = () => {
  const json = localStorage.getItem('pleroma-fe-theme-cache')
  if (!json) return null
  let cache
  try {
    cache = JSON.parse(json)
  } catch (e) {
    console.error('Failed to decode theme cache:', e)
    return false
  }
  if (cache.engineChecksum === getEngineChecksum()) {
    const eagerStyles = createStyleSheet(EAGER_STYLE_ID)
    const lazyStyles = createStyleSheet(LAZY_STYLE_ID)

    cache.data[0].forEach(rule => eagerStyles.sheet.insertRule(rule, 'index-max'))
    cache.data[1].forEach(rule => lazyStyles.sheet.insertRule(rule, 'index-max'))

    adoptStyleSheets([eagerStyles, lazyStyles])

    return true
  } else {
    console.warn('Engine checksum doesn\'t match, cache not usable, clearing')
    localStorage.removeItem('pleroma-fe-theme-cache')
  }
}

export const applyTheme = async (input, onFinish = (data) => {}, debug) => {
  const eagerStyles = createStyleSheet(EAGER_STYLE_ID)
  const lazyStyles = createStyleSheet(LAZY_STYLE_ID)

  console.log('DEBUG IS', debug)

  const { lazyProcessFunc } = await generateTheme(
    input,
    {
      onNewRule (rule, isLazy) {
        if (isLazy) {
          lazyStyles.sheet.insertRule(rule, 'index-max')
          lazyStyles.rules.push(rule)
        } else {
          eagerStyles.sheet.insertRule(rule, 'index-max')
          eagerStyles.rules.push(rule)
        }
      },
      onEagerFinished () {
        adoptStyleSheets([eagerStyles])
      },
      onLazyFinished () {
        adoptStyleSheets([eagerStyles, lazyStyles])
        const cache = { engineChecksum: getEngineChecksum(), data: [eagerStyles.rules, lazyStyles.rules] }
        onFinish(cache)
        localStorage.setItem('pleroma-fe-theme-cache', JSON.stringify(cache))
      }
    },
    debug
  )

  setTimeout(lazyProcessFunc, 0)

  return Promise.resolve()
}

const extractStyleConfig = ({
  sidebarColumnWidth,
  contentColumnWidth,
  notifsColumnWidth,
  emojiReactionsScale,
  emojiSize,
  navbarSize,
  panelHeaderSize,
  textSize,
  forcedRoundness
}) => {
  const result = {
    sidebarColumnWidth,
    contentColumnWidth,
    notifsColumnWidth,
    emojiReactionsScale,
    emojiSize,
    navbarSize,
    panelHeaderSize,
    textSize
  }

  console.log(forcedRoundness)
  switch (forcedRoundness) {
    case 'disable':
      break
    case '0':
      result.forcedRoundness = '0'
      break
    case '1':
      result.forcedRoundness = '1px'
      break
    case '2':
      result.forcedRoundness = '0.4rem'
      break
    default:
  }

  return result
}

const defaultStyleConfig = extractStyleConfig(defaultState)

export const applyConfig = (input) => {
  const config = extractStyleConfig(input)

  if (config === defaultStyleConfig) {
    return
  }

  const head = document.head
  const body = document.body
  body.classList.add('hidden')

  const rules = Object
    .entries(config)
    .filter(([k, v]) => v)
    .map(([k, v]) => `--${k}: ${v}`).join(';')

  document.getElementById('style-config')?.remove()
  const styleEl = document.createElement('style')
  styleEl.id = 'style-config'
  head.appendChild(styleEl)
  const styleSheet = styleEl.sheet

  styleSheet.toString()
  styleSheet.insertRule(`:root { ${rules} }`, 'index-max')

  if (Object.prototype.hasOwnProperty.call(config, 'forcedRoundness')) {
    styleSheet.insertRule(` * {
        --roundness: var(--forcedRoundness) !important;
    }`, 'index-max')
  }

  body.classList.remove('hidden')
}

export const getThemes = () => {
  const cache = 'no-store'

  return window.fetch('/static/styles.json', { cache })
    .then((data) => data.json())
    .then((themes) => {
      return Object.entries(themes).map(([k, v]) => {
        let promise = null
        if (typeof v === 'object') {
          promise = Promise.resolve(v)
        } else if (typeof v === 'string') {
          promise = window.fetch(v, { cache })
            .then((data) => data.json())
            .catch((e) => {
              console.error(e)
              return null
            })
        }
        return [k, promise]
      })
    })
    .then((promises) => {
      return promises
        .reduce((acc, [k, v]) => {
          acc[k] = v
          return acc
        }, {})
    })
}

export const getPreset = (val) => {
  return getThemes()
    .then((themes) => themes[val] ? themes[val] : themes['pleroma-dark'])
    .then((theme) => {
      const isV1 = Array.isArray(theme)
      const data = isV1 ? {} : theme.theme

      if (isV1) {
        const bg = hex2rgb(theme[1])
        const fg = hex2rgb(theme[2])
        const text = hex2rgb(theme[3])
        const link = hex2rgb(theme[4])

        const cRed = hex2rgb(theme[5] || '#FF0000')
        const cGreen = hex2rgb(theme[6] || '#00FF00')
        const cBlue = hex2rgb(theme[7] || '#0000FF')
        const cOrange = hex2rgb(theme[8] || '#E3FF00')

        data.colors = { bg, fg, text, link, cRed, cBlue, cGreen, cOrange }
      }

      return { theme: data, source: theme.source }
    })
}

export const setPreset = (val) => getPreset(val).then(data => applyTheme(data))
