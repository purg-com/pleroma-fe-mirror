import allKeys from './theme2_keys'

// keys that are meant to be used globally, i.e. what's the rest of the theme is based upon.
export const basePaletteKeys = new Set([
  'bg',
  'fg',
  'text',
  'link',
  'accent',

  'cBlue',
  'cRed',
  'cGreen',
  'cOrange'
])

export const shadowsKeys = new Set([
  'panel',
  'topBar',
  'popup',
  'avatar',
  'avatarStatus',
  'panelHeader',
  'button',
  'buttonHover',
  'buttonPressed',
  'input'
])

// Keys that are not available in editor and never meant to be edited
export const hiddenKeys = new Set([
  'profileBg',
  'profileTint'
])

export const extendedBasePrefixes = [
  'border',
  'icon',
  'highlight',
  'lightText',

  'popover',

  'panel',
  'topBar',
  'tab',
  'btn',
  'input',
  'selectedMenu',

  'alert',
  'badge',

  'post',
  'selectedPost', // wrong nomenclature
  'poll',

  'chatBg',
  'chatMessageIncoming',
  'chatMessageOutgoing'
]

export const extendedBaseKeys = Object.fromEntries(extendedBasePrefixes.map(prefix => [prefix, allKeys.filter(k => k.startsWith(prefix))]))

// Keysets that are only really used intermideately, i.e. to generate other colors
export const temporary = new Set([
  'border',
  'highlight'
])

export const temporaryColors = {}

export const convertTheme2To3 = (data) => {
  const generateRoot = () => {
    const directives = {}
    basePaletteKeys.forEach(key => { directives['--' + key] = 'color | ' + data.colors[key] })
    return {
      component: 'Root',
      directives
    }
  }

  const convertShadows = () => {
    const newRules = []
    shadowsKeys.forEach(key => {
      const originalShadow = data.shadows[key]
      const rule = {}

      switch (key) {
        case 'panel':
          rule.component = 'Panel'
          break
        case 'topBar':
          rule.component = 'TopBar'
          break
        case 'popup':
          rule.component = 'Popover'
          break
        case 'avatar':
          rule.component = 'Avatar'
          break
        case 'avatarStatus':
          rule.component = 'Avatar'
          rule.parent = { component: 'Post' }
          break
        case 'panelHeader':
          rule.component = 'PanelHeader'
          break
        case 'button':
          rule.component = 'Button'
          break
        case 'buttonHover':
          rule.component = 'Button'
          rule.state = ['hover']
          break
        case 'buttonPressed':
          rule.component = 'Button'
          rule.state = ['pressed']
          break
        case 'input':
          rule.component = 'Input'
          break
      }
      rule.directives = {
        shadow: originalShadow
      }
      newRules.push(rule)
    })
    return newRules
  }

  return [generateRoot(), ...convertShadows()]
}
