<template>
  <div
    class="range-control style-control"
    :class="{ disabled: !present || disabled }"
  >
    <label
      :id="name + '-label'"
      :for="name"
      class="label"
    >
      {{ label }}
    </label>
    <input
      v-if="typeof fallback !== 'undefined'"
      :id="name + '-o'"
      :aria-labelledby="name + '-label'"
      class="input -checkbox opt visible-for-screenreader-only"
      type="checkbox"
      :checked="present"
      @change="$emit('update:modelValue', !present ? fallback : undefined)"
    >
    <label
      v-if="typeof fallback !== 'undefined'"
      class="opt-l"
      :for="name + '-o'"
      :aria-hidden="true"
    />
    <input
      :id="name"
      class="input input-number"
      type="range"
      :value="modelValue || fallback"
      :disabled="!present || disabled"
      :max="max || hardMax || 100"
      :min="min || hardMin || 0"
      :step="step || 1"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <input
      :id="name + '-numeric'"
      class="input input-number"
      type="number"
      :aria-labelledby="name + '-label'"
      :value="modelValue || fallback"
      :disabled="!present || disabled"
      :max="hardMax"
      :min="hardMin"
      :step="step || 1"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<script>
export default {
  props: [
    'name', 'modelValue', 'fallback', 'disabled', 'label', 'max', 'min', 'step', 'hardMin', 'hardMax'
  ],
  emits: ['update:modelValue'],
  computed: {
    present () {
      return typeof this.modelValue !== 'undefined'
    }
  }
}
</script>
