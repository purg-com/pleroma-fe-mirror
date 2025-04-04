import { init, getEngineChecksum } from '../theme_data/theme_data_3.service.js'
import { getCssRules } from '../theme_data/css_utils.js'
import { defaultState } from 'src/modules/default_config_state.js'
import { chunk } from 'lodash'
import localforage from 'localforage'

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
    onNewRule = () => {},
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

export const tryLoadCache = async () => {
  console.info('Trying to load compiled theme data from cache')
  const cache = await localforage.getItem('pleromafe-theme-cache')
  if (!cache) return null
  try {
    if (cache.engineChecksum === getEngineChecksum()) {
      const eagerStyles = createStyleSheet(EAGER_STYLE_ID)
      const lazyStyles = createStyleSheet(LAZY_STYLE_ID)

      cache.data[0].forEach(rule => eagerStyles.sheet.insertRule(rule, 'index-max'))
      cache.data[1].forEach(rule => lazyStyles.sheet.insertRule(rule, 'index-max'))

      adoptStyleSheets([eagerStyles, lazyStyles])

      console.info(`Loaded theme from cache`)
      return true
    } else {
      console.warn('Engine checksum doesn\'t match, cache not usable, clearing')
      localStorage.removeItem('pleroma-fe-theme-cache')
    }
  } catch (e) {
    console.error('Failed to load theme cache:', e)
    return false
  }
}

export const applyTheme = (
  input,
  onEagerFinish = () => {},
  onFinish = () => {},
  debug
) => {
  const eagerStyles = createStyleSheet(EAGER_STYLE_ID)
  const lazyStyles = createStyleSheet(LAZY_STYLE_ID)

  const insertRule = (styles, rule) => {
    try {
      // Try to use modern syntax first
      try {
        styles.sheet.insertRule(rule, 'index-max')
        styles.rules.push(rule)
      } catch {
        // Fallback for older browsers that don't support 'index-max'
        styles.sheet.insertRule(rule, styles.sheet.cssRules.length)
        styles.rules.push(rule)
      }
    } catch (e) {
      console.warn('Can\'t insert rule due to lack of support', e, rule)

      // Try to sanitize the rule for better compatibility
      try {
        // Remove any potentially problematic CSS features
        let sanitizedRule = rule
          .replace(/backdrop-filter:[^;]+;/g, '') // Remove backdrop-filter
          .replace(/var\(--shadowFilter\)[^;]*;/g, '') // Remove shadowFilter references

        if (sanitizedRule !== rule) {
          styles.sheet.insertRule(sanitizedRule, styles.sheet.cssRules.length)
          styles.rules.push(sanitizedRule)
        }
      } catch (e2) {
        console.error('Failed to insert even sanitized rule', e2)
      }
    }
  }

  const { lazyProcessFunc } = generateTheme(
    input,
    {
      onNewRule (rule, isLazy) {
        if (isLazy) {
          insertRule(lazyStyles, rule)
        } else {
          insertRule(eagerStyles, rule)
        }
      },
      onEagerFinished () {
        adoptStyleSheets([eagerStyles])
        onEagerFinish()
        console.info('Eager part of theme finished, waiting for lazy part to finish to store cache')
      },
      onLazyFinished () {
        adoptStyleSheets([eagerStyles, lazyStyles])
        const cache = { engineChecksum: getEngineChecksum(), data: [eagerStyles.rules, lazyStyles.rules] }
        onFinish(cache)
        localforage.setItem('pleromafe-theme-cache', cache)
        console.info('Theme cache stored')
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
  themeEditorMinWidth,
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
    themeEditorMinWidth: parseInt(themeEditorMinWidth) === 0 ? 'fit-content' : themeEditorMinWidth,
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

export const applyConfig = (input) => {
  const config = extractStyleConfig(input)

  if (config === defaultStyleConfig) {
    return
  }

  const head = document.head

  const rules = Object
    .entries(config)
    .filter(([, v]) => v)
    .map(([k, v]) => `--${k}: ${v}`).join(';')

  document.getElementById('style-config')?.remove()
  const styleEl = document.createElement('style')
  styleEl.id = 'style-config'
  head.appendChild(styleEl)
  const styleSheet = styleEl.sheet

  styleSheet.toString()
  styleSheet.insertRule(`:root { ${rules} }`, 'index-max')

  // TODO find a way to make this not apply to theme previews
  if (Object.prototype.hasOwnProperty.call(config, 'forcedRoundness')) {
    styleSheet.insertRule(` *:not(.preview-block) {
        --roundness: var(--forcedRoundness) !important;
    }`, 'index-max')
  }
}

export const getResourcesIndex = async (url, parser = JSON.parse) => {
  const cache = 'no-store'
  const customUrl = url.replace(/\.(\w+)$/, '.custom.$1')
  let builtin
  let custom

  const resourceTransform = (resources) => {
    return Object
      .entries(resources)
      .map(([k, v]) => {
        if (typeof v === 'object') {
          return [k, () => Promise.resolve(v)]
        } else if (typeof v === 'string') {
          return [
            k,
            () => window
              .fetch(v, { cache })
              .then(data => data.text())
              .then(text => parser(text))
              .catch(e => {
                console.error(e)
                return null
              })
          ]
        } else {
          console.error(`Unknown resource format - ${k} is a ${typeof v}`)
          return [k, null]
        }
      })
  }

  try {
    const builtinData = await window.fetch(url, { cache })
    const builtinResources = await builtinData.json()
    builtin = resourceTransform(builtinResources)
  } catch {
    builtin = []
    console.warn(`Builtin resources at ${url} unavailable`)
  }

  try {
    const customData = await window.fetch(customUrl, { cache })
    const customResources = await customData.json()
    custom = resourceTransform(customResources)
  } catch {
    custom = []
    console.warn(`Custom resources at ${customUrl} unavailable`)
  }

  const total = [...custom, ...builtin]
  if (total.length === 0) {
    return Promise.reject(new Error(`Resource at ${url} and ${customUrl} completely unavailable. Panicking`))
  }
  return Promise.resolve(Object.fromEntries(total))
}
