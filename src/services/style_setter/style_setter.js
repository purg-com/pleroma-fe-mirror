import { init, getEngineChecksum } from '../theme_data/theme_data_3.service.js'
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

export const generateTheme = (inputRuleset, callbacks, debug) => {
  const {
    onNewRule = (rule, isLazy) => {},
    onLazyFinished = () => {},
    onEagerFinished = () => {}
  } = callbacks

  const themes3 = init({
    inputRuleset,
    debug
  })

  getCssRules(themes3.eager, debug).forEach(rule => {
    // Hacks to support multiple selectors on same component
    onNewRule(rule, false)
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
        onNewRule(rule, true)
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

export const applyTheme = (input, onFinish = (data) => {}, debug) => {
  const eagerStyles = createStyleSheet(EAGER_STYLE_ID)
  const lazyStyles = createStyleSheet(LAZY_STYLE_ID)

  const { lazyProcessFunc } = generateTheme(
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
        try {
          localStorage.setItem('pleroma-fe-theme-cache', JSON.stringify(cache))
        } catch (e) {
          localStorage.removeItem('pleroma-fe-theme-cache')
          try {
            localStorage.setItem('pleroma-fe-theme-cache', JSON.stringify(cache))
          } catch (e) {
            console.warn('cannot save cache!', e)
          }
        }
      }
    },
    debug
  )

  setTimeout(lazyProcessFunc, 0)
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

export const applyConfig = (input, i18n) => {
  const config = extractStyleConfig(input)

  if (config === defaultStyleConfig) {
    return
  }

  const head = document.head

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
}

export const getResourcesIndex = async (url) => {
  const cache = 'no-store'

  try {
    const data = await window.fetch(url, { cache })
    const resources = await data.json()
    return Object.fromEntries(
      Object
        .entries(resources)
        .map(([k, v]) => {
          if (typeof v === 'object') {
            return [k, () => Promise.resolve(v)]
          } else if (typeof v === 'string') {
            return [
              k,
              () => window
                .fetch(v, { cache })
                .then((data) => data.json())
                .catch((e) => {
                  console.error(e)
                  return null
                })
            ]
          } else {
            console.error(`Unknown resource format - ${k} is a ${typeof v}`)
            return [k, null]
          }
        })
    )
  } catch (e) {
    return Promise.reject(e)
  }
}
