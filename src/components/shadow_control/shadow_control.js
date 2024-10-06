import ColorInput from 'src/components/color_input/color_input.vue'
import OpacityInput from 'src/components/opacity_input/opacity_input.vue'
import Select from 'src/components/select/select.vue'
import SelectMotion from 'src/components/select/select_motion.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Popover from 'src/components/popover/popover.vue'
import ComponentPreview from 'src/components/component_preview/component_preview.vue'
import { getCssShadow, getCssShadowFilter } from '../../services/theme_data/theme_data.service.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { throttle } from 'lodash'
import {
  faTimes,
  faChevronDown,
  faChevronUp,
  faPlus
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronDown,
  faChevronUp,
  faTimes,
  faPlus
)

const toModel = (input) => {
  if (typeof input === 'object') {
    return {
      x: 0,
      y: 0,
      blur: 0,
      spread: 0,
      inset: false,
      color: '#000000',
      alpha: 1,
      ...input
    }
  } else if (typeof input === 'string') {
    return input
  }
}

export default {
  props: [
    'modelValue',
    'fallback',
    'separateInset',
    'noPreview',
    'disabled',
    'compact'
  ],
  emits: ['update:modelValue', 'subShadowSelected'],
  data () {
    console.log('MODEL VALUE', this.modelValue, this.fallback)
    return {
      selectedId: 0,
      // TODO there are some bugs regarding display of array (it's not getting updated when deleting for some reason)
      cValue: (this.modelValue ?? this.fallback ?? []).map(toModel)
    }
  },
  components: {
    ColorInput,
    OpacityInput,
    Select,
    SelectMotion,
    Checkbox,
    Popover,
    ComponentPreview
  },
  beforeUpdate () {
    this.cValue = (this.modelValue ?? this.fallback ?? []).map(toModel)
  },
  computed: {
    selectedType: {
      get () {
        return typeof this.selected
      },
      set (newType) {
        this.selected = toModel(newType === 'object' ? {} : '')
      }
    },
    selected: {
      get () {
        const selected = this.cValue[this.selectedId]
        if (selected && typeof selected === 'object') {
          return { ...selected }
        } else if (typeof selected === 'string') {
          return selected
        }
        return null
      },
      set (value) {
        this.cValue[this.selectedId] = toModel(value)
        this.$emit('update:modelValue', this.cValue)
      }
    },
    present () {
      return this.selected != null && !this.usingFallback
    },
    shadowsAreNull () {
      return this.modelValue == null
    },
    currentFallback () {
      return this.fallback?.[this.selectedId]
    },
    usingFallback () {
      return this.modelValue == null
    },
    style () {
      try {
        if (this.separateInset) {
          return {
            filter: getCssShadowFilter(this.cValue),
            boxShadow: getCssShadow(this.cValue, true)
          }
        }
        return {
          boxShadow: getCssShadow(this.cValue)
        }
      } catch (e) {
        return {
          border: '1px solid red'
        }
      }
    }
  },
  watch: {
    modelValue (value) {
      if (!value) this.cValue = (this.modelValue ?? this.fallback ?? []).map(toModel)
    },
    selected (value) {
      this.$emit('subShadowSelected', this.selectedId)
    }
  },
  methods: {
    getNewSubshadow () {
      return toModel(this.selected)
    },
    onSelectChange (id) {
      this.selectedId = id
    },
    getSubshadowLabel (shadow, index) {
      if (typeof shadow === 'object') {
        return shadow?.name ?? this.$t('settings.style.shadows.shadow_id', { value: index })
      } else if (typeof shadow === 'string') {
        return shadow || this.$t('settings.style.shadows.empty_expression')
      }
    },
    updateProperty: throttle(function (prop, value) {
      this.cValue[this.selectedId][prop] = value
      if (prop === 'inset' && value === false && this.separateInset) {
        this.cValue[this.selectedId].spread = 0
      }
      this.$emit('update:modelValue', this.cValue)
    }, 100)
  }
}
