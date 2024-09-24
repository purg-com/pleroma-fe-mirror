// import {
//   rgb2hex,
//   hex2rgb,
//   getContrastRatioLayers,
//   relativeLuminance
// } from 'src/services/color_convert/color_convert.js'

// import {
//   getThemes
// } from 'src/services/style_setter/style_setter.js'

// import {
//   newImporter,
//   newExporter
// } from 'src/services/export_import/export_import.js'

// import { convertTheme2To3 } from 'src/services/theme_data/theme2_to_theme3.js'
// import { init } from 'src/services/theme_data/theme_data_3.service.js'
// import {
//   getCssRules,
//   getScopedVersion
// } from 'src/services/theme_data/css_utils.js'

// import ColorInput from 'src/components/color_input/color_input.vue'
// import RangeInput from 'src/components/range_input/range_input.vue'
// import OpacityInput from 'src/components/opacity_input/opacity_input.vue'
// import ShadowControl from 'src/components/shadow_control/shadow_control.vue'
// import FontControl from 'src/components/font_control/font_control.vue'
// import ContrastRatio from 'src/components/contrast_ratio/contrast_ratio.vue'
// import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
// import Checkbox from 'src/components/checkbox/checkbox.vue'
/* eslint-disable no-unused-vars */

import Select from 'src/components/select/select.vue'
import Preview from './theme_preview.vue'

import { defineOptions, ref } from 'vue'
const componentsContext = require.context('src', true, /\.style.js(on)?$/)
const componentNames = componentsContext.keys()
const componentName = ref(componentNames[0])
