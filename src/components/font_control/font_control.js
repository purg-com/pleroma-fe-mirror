import { set } from 'lodash'
import Select from '../select/select.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Popover from 'src/components/popover/popover.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

library.add(
  faExclamationTriangle
)

const PRESET_FONTS = new Set(['serif', 'sans-serif', 'monospace', 'inherit'])

export default {
  components: {
    Select,
    Checkbox,
    Popover
  },
  props: [
    'name', 'label', 'modelValue', 'fallback', 'options', 'no-inherit'
  ],
  emits: ['update:modelValue'],
  data () {
    return {
      localValue: this.modelValue,
      customFamily: '',
      availableOptions: [
        this.noInherit ? '' : 'inherit',
        'local',
        ...(this.options || []),
        'serif',
        'monospace',
        'sans-serif'
      ].filter(_ => _)
    }
  },
  beforeUpdate () {
    this.localValue = this.modelValue
  },
  computed: {
    present () {
      return typeof this.localValue !== 'undefined'
    },
    defaultValue () {
      return this.localValue || this.fallback || {}
    },
    family: {
      get () {
        return this.defaultValue.family
      },
      set (v) {
        set(this.localValue, 'family', v)
        this.$emit('update:modelValue', this.localValue)
      }
    },
    familyCustom: {
      get () {
        return this.customFamily
      },
      set (v) {
        this.customFamily = v
        if (!PRESET_FONTS.has(this.customFamily)) {
          set(this.localValue, 'family', v)
          this.$emit('update:modelValue', this.customFamily)
        }
      }
    },
    invalidCustom () {
      return PRESET_FONTS.has(this.customFamily)
    },
    isCustom () {
      return !PRESET_FONTS.has(this.family)
    },
    preset: {
      get () {
        if (PRESET_FONTS.has(this.family)) {
          return this.family
        } else {
          return 'local'
        }
      },
      set (v) {
        this.family = v === 'local' ? '' : v
      }
    }
  }
}
