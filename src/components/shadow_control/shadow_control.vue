<template>
  <div
    class="label shadow-control"
    :class="{ disabled: !present }"
  >
    <div class="shadow-preview">
      <label
        class="header"
        :class="{ faint: !present }"
      >
        {{ $t('settings.style.shadows.offset') }}
      </label>
      <input
        v-model="selected.y"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-number y-shift-number"
        type="number"
      >
      <input
        v-model="selected.y"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-range y-shift-slider"
        type="range"
        max="20"
        min="-20"
      >
      <div
        class="preview-window"
        :class="{ disabled: !present, '-light-grid': lightGrid }"
      >
        <div
          class="preview-block"
          :style="style"
        />
      </div>
      <input
        v-model="selected.x"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-number x-shift-number"
        type="number"
      >
      <input
        v-model="selected.x"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-range x-shift-slider"
        type="range"
        max="20"
        min="-20"
      >
      <Checkbox
        id="inset"
        v-model="lightGrid"
        :disabled="!present"
        name="lightGrid"
        class="input-light-grid"
      >
        {{ $t('settings.style.shadows.light_grid') }}
      </Checkbox>
    </div>
    <div class="shadow-switcher">
      <Select
        id="shadow-list"
        v-model="selectedId"
        class="shadow-list"
        size="10"
        :disabled="!ready || usingFallback"
      >
        <option
          v-for="(shadow, index) in cValue"
          :key="index"
          :value="index"
          :class="{ '-active': index === Number(selectedId) }"
        >
          {{ shadow.name ?? $t('settings.style.shadows.shadow_id', { value: index }) }}
        </option>
      </Select>
      <div
        :disabled="usingFallback"
        class="id-control arrange-buttons"
      >
        <button
          class="btn button-default"
          :disabled="!ready || !present"
          :class="{ disabled: !present }"
          @click="del"
        >
          <FAIcon
            fixed-width
            icon="times"
          />
        </button>
        <button
          class="btn button-default"
          :disabled="!moveUpValid"
          :class="{ disabled: !present }"
          @click="moveUp"
        >
          <FAIcon
            fixed-width
            icon="chevron-up"
          />
        </button>
        <button
          class="btn button-default"
          :disabled="!moveDnValid"
          @click="moveDn"
        >
          <FAIcon
            fixed-width
            icon="chevron-down"
          />
        </button>
        <button
          class="btn button-default"
          :disabled="usingFallback || !present"
          @click="add"
        >
          <FAIcon
            fixed-width
            icon="plus"
          />
        </button>
      </div>
    </div>
    <div class="shadow-tweak">
      <div
        :disabled="!present"
        :class="{ disabled: !present }"
        class="name-control style-control"
      >
        <label
          for="spread"
          class="label"
          :class="{ faint: !present }"
        >
          {{ $t('settings.style.shadows.name') }}
        </label>
        <input
          id="name"
          v-model="selected.name"
          :disabled="!present"
          :class="{ disabled: !present }"
          name="name"
          class="input input-string"
        >
      </div>
      <div
        :disabled="!present"
        class="inset-control style-control"
      >
        <Checkbox
          id="inset"
          v-model="selected.inset"
          :disabled="!present"
          name="inset"
          class="input-inset input-boolean"
        >
          <template #before>
            {{ $t('settings.style.shadows.inset') }}
          </template>
        </Checkbox>
      </div>
      <div
        :disabled="!present"
        :class="{ disabled: !present }"
        class="blur-control style-control"
      >
        <label
          for="spread"
          class="label"
          :class="{ faint: !present }"
        >
          {{ $t('settings.style.shadows.blur') }}
        </label>
        <input
          id="blur"
          v-model="selected.blur"
          :disabled="!present"
          :class="{ disabled: !present }"
          name="blur"
          class="input input-range"
          type="range"
          max="20"
          min="0"
        >
        <input
          v-model="selected.blur"
          :disabled="!present"
          :class="{ disabled: !present }"
          class="input input-number"
          type="number"
          min="0"
        >
      </div>
      <div
        :disabled="!present"
        class="spread-control style-control"
        :class="{ disabled: !present }"
      >
        <label
          for="spread"
          class="label"
          :class="{ faint: !present }"
        >
          {{ $t('settings.style.shadows.spread') }}
        </label>
        <input
          id="spread"
          v-model="selected.spread"
          :disabled="!present"
          :class="{ disabled: !present }"
          name="spread"
          class="input input-range"
          type="range"
          max="20"
          min="-20"
        >
        <input
          v-model="selected.spread"
          :disabled="!present"
          :class="{ disabled: !present }"
          class="input input-number"
          type="number"
        >
      </div>
      <ColorInput
        v-model="selected.color"
        :disabled="!present"
        :label="$t('settings.style.common.color')"
        :fallback="currentFallback.color"
        :show-optional-tickbox="false"
        name="shadow"
      />
      <OpacityInput
        v-model="selected.alpha"
        :disabled="!present"
      />
      <i18n-t
        scope="global"
        keypath="settings.style.shadows.hintV3"
        :class="{ faint: !present }"
        tag="p"
      >
        <code>--variable,mod</code>
      </i18n-t>
    </div>
  </div>
</template>

<script src="./shadow_control.js"></script>

<style src="./shadow_control.scss" lang="scss"></style>
