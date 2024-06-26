<template>
  <div
    class="font-control"
    :class="{ custom: isCustom }"
  >
    <label
      :id="name + '-label'"
      :for="preset === 'custom' ? name : name + '-font-switcher'"
      class="label"
    >
      {{ label }}
    </label>
    {{ ' ' }}
    <Checkbox
      v-if="typeof fallback !== 'undefined'"
      :id="name + '-o'"
      :modelValue="present"
      @change="$emit('update:modelValue', typeof modelValue === 'undefined' ? fallback : undefined)"
    >
      {{ $t('settings.style.themes3.define') }}
    </Checkbox>
    <p>
      <Select
        :id="name + '-font-switcher'"
        v-model="preset"
        :disabled="!present"
        class="font-switcher"
      >
        <option
          v-for="option in availableOptions"
          :key="option"
          :value="option"
        >
          {{ $t('settings.style.themes3.font.' + option) }}
        </option>
      </Select>
    </p>
    <p>
      <input
        v-if="isCustom"
        :id="name"
        v-model="familyCustom"
        class="input custom-font"
        type="text"
      >
      <span
        v-if="invalidCustom"
        class="InvalidIndicator"
      >
        <Popover
          trigger="hover"
          :trigger-attrs="{ 'aria-label': $t('settings.style.themes3.font.invalid_custom_reserved') }"
        >
          <template #trigger>
            &nbsp;
            <FAIcon icon="exclamation-triangle" />
          </template>
          <template #content>
            <div class="invalid-tooltip">
              {{ $t('settings.style.themes3.font.invalid_custom_reserved') }}
            </div>
          </template>
        </Popover>
      </span>
    </p>
  </div>
</template>

<script src="./font_control.js"></script>

<style lang="scss">
.font-control {
  input.custom-font {
    min-width: 12em;
  }
}

.invalid-tooltip {
  margin: 0.5em 1em;
  min-width: 10em;
  text-align: center;
}
</style>
