import allKeys from './theme2_keys'

// keys that are meant to be used globally, i.e. what's the rest of the theme is based upon.
const basePaletteKeys = new Set([
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

// Keys that are not available in editor and never meant to be edited
const hiddenKeys = new Set([
  'profileBg',
  'profileTint'
])

const extendedBasePrefixes = [
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

const extendedBaseKeys = Object.fromEntries(extendedBasePrefixes.map(prefix => [prefix, allKeys.filter(k => k.startsWith(prefix))]))

// Keysets that are only really used intermideately, i.e. to generate other colors
const temporary = new Set([
  'border',
  'highlight'
])

const temporaryColors = {}
