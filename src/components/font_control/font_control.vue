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
      {{ ' ' }}
      <Checkbox
        v-if="typeof fallback !== 'undefined'"
        :id="name + '-o'"
        :modelValue="present"
        @change="$emit('update:modelValue', typeof modelValue === 'undefined' ? fallback : undefined)"
      >
        {{ $t('settings.style.themes3.define') }}
      </Checkbox>
    </p>
    <p v-if="isCustom">
      <label
        v-if="fontsList !== null && !manualEntry"
        :id="name + '-label'"
        :for="preset === 'custom' ? name : name + '-font-switcher'"
        class="label"
      >
        {{ $t('settings.style.themes3.font.select') }}
      </label>
      <label
        v-else
        :id="name + '-label'"
        :for="preset === 'custom' ? name : name + '-font-switcher'"
        class="label"
      >
        <i18n-t
          keypath="settings.style.themes3.font.entry"
          tag="span"
        >
          <template #fontFamily>
            <code>font-family</code>
          </template>
        </i18n-t>
      </label>
      {{ ' ' }}
      <span class="btn-group">
        <button
          v-if="fontsListCapable && (fontsList === null || manualEntry)"
          class="btn button-default"
          @click="lookupLocalFonts"
          :title="$t('settings.style.themes3.font.lookup_local_fonts')"
        >
          <FAIcon
            fixed-width
            icon="font"
          />
        </button>
          <input
            v-if="fontsLists === null || manualEntry"
            :id="name"
            v-model="familyCustom"
            class="input custom-font"
            type="text"
          >
      </span>
      <span class="btn-group">
        <button
          v-if="fontsList !== null && !manualEntry"
          class="btn button-default"
          @click="toggleManualEntry"
          :title="$t('settings.style.themes3.font.enter_manually')"
        >
          <FAIcon
            fixed-width
            icon="keyboard"
          />
        </button>
        <Select
          v-if="fontsList !== null && !manualEntry"
          :id="name + '-local-font-switcher'"
          v-model="familyCustom"
          class="custom-font"
        >
          <option
            v-for="option in fontsList.values()"
            :key="option"
            :value="option"
            :style="{ fontFamily: option }"
          >
            {{ option }}
          </option>
        </Select>
      </span>
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
  .custom-font {
    min-width: 20em;
    max-width: 20em;
  }
}

.invalid-tooltip {
  margin: 0.5em 1em;
  min-width: 10em;
  text-align: center;
}
</style>
