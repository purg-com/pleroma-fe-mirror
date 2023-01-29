<template>
  <label
    class="checkbox"
    :class="{ disabled, indeterminate }"
  >
    <input
      type="checkbox"
      :disabled="disabled"
      :checked="modelValue"
      :indeterminate="indeterminate"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <i class="checkbox-indicator" />
    <span
      v-if="!!$slots.default"
      class="label"
    >
      <slot />
    </span>
  </label>
</template>

<script>
export default {
  props: [
    'modelValue',
    'indeterminate',
    'disabled'
  ],
  emits: ['update:modelValue']
}
</script>

<style lang="scss">
@import "../../variables";

.checkbox {
  position: relative;
  display: inline-block;
  min-height: 1.2em;

  &-indicator,
  & .label {
    vertical-align: middle;
  }

  &-indicator {
    display: inline-block;
    position: relative;
    width: 1.2em;
    height: 1.2em;
  }

  &-indicator::before {
    position: absolute;
    inset: 0;
    display: block;
    content: "✓";
    transition: color 200ms;
    border-radius: $fallback--checkboxRadius;
    border-radius: var(--checkboxRadius, $fallback--checkboxRadius);
    box-shadow: 0 0 2px black inset;
    box-shadow: var(--inputShadow);
    background-color: $fallback--fg;
    background-color: var(--input, $fallback--fg);
    vertical-align: top;
    text-align: center;
    line-height: 1.1em;
    font-size: 1.1em;
    color: transparent;
    overflow: hidden;
    box-sizing: border-box;
  }

  &.disabled {
    .checkbox-indicator::before,
    .label {
      opacity: 0.5;
    }

    .label {
      color: $fallback--faint;
      color: var(--faint, $fallback--faint);
    }
  }

  input[type="checkbox"] {
    display: none;

    &:checked + .checkbox-indicator::before {
      color: $fallback--text;
      color: var(--inputText, $fallback--text);
    }

    &:indeterminate + .checkbox-indicator::before {
      content: "–";
      color: $fallback--text;
      color: var(--inputText, $fallback--text);
    }
  }

  & > span {
    margin-left: 0.5em;
  }
}
</style>
