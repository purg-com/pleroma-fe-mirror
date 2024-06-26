import { set, clone } from 'lodash'
import Select from '../select/select.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Popover from 'src/components/popover/popover.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faExclamationTriangle,
  faKeyboard,
  faFont
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faExclamationTriangle,
  faKeyboard,
  faFont
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
      manualEntry: true,
      localValue: clone(this.modelValue),
      familyCustomLocal: null,
      availableOptions: [
        this.noInherit ? '' : 'inherit',
        'serif',
        'sans-serif',
        'monospace',
        'local',
        ...(this.options || [])
      ].filter(_ => _)
    }
  },
  beforeUpdate () {
    this.localValue = clone(this.modelValue)
    if (this.familyCustomLocal === null && !this.isInvalidFamily(this.modelValue?.family)) {
      this.familyCustomLocal = this.modelValue?.family
    }
  },
  methods: {
    lookupLocalFonts () {
      if (!this.fontsList) {
        this.$store.dispatch('queryLocalFonts')
      }
      this.toggleManualEntry()
    },
    isInvalidFamily (value) {
      return PRESET_FONTS.has(value) || (value === '')
    },
    toggleManualEntry () {
      this.manualEntry = !this.manualEntry
    }
  },
  computed: {
    present () {
      return typeof this.localValue !== 'undefined'
    },
    defaultValue () {
      return this.localValue || this.fallback || {}
    },
    fontsListCapable () {
      return this.$store.state.interface.browserSupport.localFonts
    },
    fontsList () {
      return this.$store.state.interface.localFonts
    },
    family: {
      get () {
        return this.defaultValue.family
      },
      set (v) {
        this.familyCustomLocal = ''
        set(this.localValue, 'family', v)
        this.$emit('update:modelValue', this.localValue)
      }
    },
    familyCustom: {
      get () {
        return this.familyCustomLocal
      },
      set (v) {
        this.familyCustomLocal = v
        if (!this.isInvalidFamily(v)) {
          set(this.localValue, 'family', v)
          this.$emit('update:modelValue', this.localValue)
        }
      }
    },
    invalidCustom () {
      return this.isInvalidFamily(this.familyCustomLocal)
    },
    isCustom () {
      return !PRESET_FONTS.has(this.defaultValue.family)
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
