<template>
<div class="ComponentPreview">
  <label
    class="header"
    v-show="shadowControl"
    :class="{ faint: disabled }"
  >
    {{ $t('settings.style.shadows.offset') }}
  </label>
  <input
    v-show="shadowControl"
    :value="shadow?.y"
    :disabled="disabled"
    :class="{ disabled }"
    class="input input-number y-shift-number"
    type="number"
    @input="e => updateProperty('y', e.target.value)"
  >
  <input
    v-show="shadowControl"
    :value="shadow?.y"
    :disabled="disabled"
    :class="{ disabled }"
    class="input input-range y-shift-slider"
    type="range"
    max="20"
    min="-20"
    @input="e => updateProperty('y', e.target.value)"
  >
  <div
    class="preview-window"
    :class="{ disabled: disabled && shadowControl, '-light-grid': lightGrid }"
  >
    <div
      class="preview-block"
      :style="previewStyle"
    />
  </div>
  <input
    v-show="shadowControl"
    :value="shadow?.x"
    :disabled="disabled"
    :class="{ disabled }"
    class="input input-number x-shift-number"
    type="number"
    @input="e => updateProperty('x', e.target.value)"
  >
  <input
    v-show="shadowControl"
    :value="shadow?.x"
    :disabled="disabled"
    :class="{ disabled }"
    class="input input-range x-shift-slider"
    type="range"
    max="20"
    min="-20"
    @input="e => updateProperty('x', e.target.value)"
  >
  <Checkbox
    id="lightGrid"
    v-model="lightGrid"
    :disabled="shadow == null"
    name="lightGrid"
    class="input-light-grid"
  >
    {{ $t('settings.style.shadows.light_grid') }}
  </Checkbox>
</div>
</template>

<style lang="scss">
.ComponentPreview {
  display: grid;
  grid-template-columns: 3em 1fr 3em;
  grid-template-rows: 2em 1fr 2em;
  grid-template-areas:
    ".       header  y-num  "
    ".       preview y-slide"
    "x-num   x-slide .      "
    "options options options";
  grid-gap: 0.5em;

  .header {
    grid-area: header;
    justify-self: center;
    align-self: baseline;
    line-height: 2;
  }

  .input-light-grid {
    grid-area: options;
    justify-self: center;
  }

  .input-number {
    min-width: 2em;
  }

  .x-shift-number {
    grid-area: x-num;
  }

  .x-shift-slider {
    grid-area: x-slide;
    height: auto;
    align-self: start;
    min-width: 10em;
  }

  .y-shift-number {
    grid-area: y-num;
  }

  .y-shift-slider {
    grid-area: y-slide;
    writing-mode: vertical-lr;
    justify-self: left;
    min-height: 10em;
  }

  .x-shift-slider,
  .y-shift-slider {
    padding: 0;
  }

  .preview-window {
    --__grid-color1: rgb(102 102 102);
    --__grid-color2: rgb(153 153 153);
    --__grid-color1-disabled: rgba(102 102 102 / 20%);
    --__grid-color2-disabled: rgba(153 153 153 / 20%);

    &.-light-grid {
      --__grid-color1: rgb(205 205 205);
      --__grid-color2: rgb(255 255 255);
      --__grid-color1-disabled: rgba(205 205 205 / 20%);
      --__grid-color2-disabled: rgba(255 255 255 / 20%);
    }

    grid-area: preview;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 10em;
    min-height: 10em;
    background-color: var(--__grid-color2);
    background-image:
      linear-gradient(45deg, var(--__grid-color1) 25%, transparent 25%),
      linear-gradient(-45deg, var(--__grid-color1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--__grid-color1) 75%),
      linear-gradient(-45deg, transparent 75%, var(--__grid-color1) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    border-radius: var(--roundness);

    &.disabled {
      background-color: var(--__grid-color2-disabled);
      background-image:
        linear-gradient(45deg, var(--__grid-color1-disabled) 25%, transparent 25%),
        linear-gradient(-45deg, var(--__grid-color1-disabled) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, var(--__grid-color1-disabled) 75%),
        linear-gradient(-45deg, transparent 75%, var(--__grid-color1-disabled) 75%);
    }

    .preview-block {
      width: 33%;
      height: 33%;
      border-radius: var(--roundness);
      background: var(--background);
    }
  }
}
</style>
<script>
import Checkbox from 'src/components/checkbox/checkbox.vue'

export default {
  props: [
    'shadow',
    'shadowControl',
    'previewClass',
    'previewStyle',
    'disabled'
  ],
  emits: ['update:shadow'],
  components: {
    Checkbox
  },
  methods: {
    update (axis, value) {
      this.$emit('update:shadow', { ...this.shadowControl, [axis]: value })
    }
  }
}
</script>
