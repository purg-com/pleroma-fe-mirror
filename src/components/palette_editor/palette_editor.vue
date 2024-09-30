<template>
  <div class="PaletteEditor">
    <ColorInput
      v-for="key in paletteKeys"
      :key="key"
      :model-value="props.modelValue[key]"
      :fallback="fallback(key)"
      :label="$t('settings.style.themes3.editor.palette.' + key)"
      @update:modelValue="value => updatePalette(key, value)"
    />
  </div>
</template>

<script setup>
import ColorInput from 'src/components/color_input/color_input.vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const paletteKeys = [
  'bg',
  'fg',
  'text',
  'link',
  'accent',
  'cRed',
  'cBlue',
  'cGreen',
  'cOrange',
  'extra1',
  'extra2',
  'extra3'
]

const fallback = (key) => {
  if (key === 'accent') {
    return props.modelValue.link
  }
  if (key === 'link') {
    return props.modelValue.accent
  }
  if (key.startsWith('extra')) {
    return '#000000'
  }
}

const updatePalette = (paletteKey, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [paletteKey]: value
  })
}
</script>

<style lang="scss">
.PaletteEditor {
  display: grid;
  justify-content: space-around;
  grid-template-columns: repeat(4, min-content);
  grid-template-rows: repeat(auto-fit, min-content);
  grid-gap: 0.5em;
}
</style>
