import ColorInput from 'src/components/color_input/color_input.vue'
import OpacityInput from 'src/components/opacity_input/opacity_input.vue'
import Select from 'src/components/select/select.vue'
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

const toModel = (object = {}) => ({
  x: 0,
  y: 0,
  blur: 0,
  spread: 0,
  inset: false,
  color: '#000000',
  alpha: 1,
  ...object
})

export default {
  props: [
    'modelValue', 'fallback', 'separateInset'
  ],
  emits: ['update:modelValue'],
  data () {
    return {
      lightGrid: false,
      selectedId: 0,
      // TODO there are some bugs regarding display of array (it's not getting updated when deleting for some reason)
      cValue: (this.modelValue ?? this.fallback ?? []).map(toModel)
    }
  },
  components: {
    ColorInput,
    OpacityInput,
    Select,
    Checkbox,
    Popover,
    ComponentPreview
  },
  beforeUpdate () {
    this.cValue = (this.modelValue ?? this.fallback ?? []).map(toModel)
  },
  computed: {
    selected () {
      const selected = this.cValue[this.selectedId]
      if (selected) {
        return { ...selected }
      }
      return null
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
    moveUpValid () {
      return this.selectedId > 0
    },
    moveDnValid () {
      return this.selectedId < this.cValue.length - 1
    },
    usingFallback () {
      return this.modelValue == null
    },
    style () {
      if (this.separateInset) {
        return {
          filter: getCssShadowFilter(this.cValue),
          boxShadow: getCssShadow(this.cValue, true)
        }
      }
      return {
        boxShadow: getCssShadow(this.cValue)
      }
    }
  },
  methods: {
    updateProperty: throttle(function (prop, value) {
      console.log(prop, value)
      this.cValue[this.selectedId][prop] = value
      if (prop === 'inset' && value === false && this.separateInset) {
        this.cValue[this.selectedId].spread = 0
      }
      this.$emit('update:modelValue', this.cValue)
    }, 100),
    add () {
      this.cValue.push(toModel(this.selected))
      this.selectedId = Math.max(this.cValue.length - 1, 0)
      this.$emit('update:modelValue', this.cValue)
    },
    del () {
      this.cValue.splice(this.selectedId, 1)
      this.selectedId = this.cValue.length === 0 ? undefined : Math.max(this.selectedId - 1, 0)
      this.$emit('update:modelValue', this.cValue)
    },
    moveUp () {
      const movable = this.cValue.splice(this.selectedId, 1)[0]
      this.cValue.splice(this.selectedId - 1, 0, movable)
      this.selectedId -= 1
      this.$emit('update:modelValue', this.cValue)
    },
    moveDn () {
      const movable = this.cValue.splice(this.selectedId, 1)[0]
      this.cValue.splice(this.selectedId + 1, 0, movable)
      this.selectedId += 1
      this.$emit('update:modelValue', this.cValue)
    }
  }
}
