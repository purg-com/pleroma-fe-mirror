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
        :value="selected?.y"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-number y-shift-number"
        type="number"
        @input="e => updateProperty('y', e.target.value)"
      >
      <input
        :value="selected?.y"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-range y-shift-slider"
        type="range"
        max="20"
        min="-20"
        @input="e => updateProperty('y', e.target.value)"
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
        :value="selected?.x"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-number x-shift-number"
        type="number"
        @input="e => updateProperty('x', e.target.value)"
      >
      <input
        :value="selected?.x"
        :disabled="!present"
        :class="{ disabled: !present }"
        class="input input-range x-shift-slider"
        type="range"
        max="20"
        min="-20"
        @input="e => updateProperty('x', e.target.value)"
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
        :disabled="shadowsAreNull"
      >
        <option
          v-for="(shadow, index) in cValue"
          :key="index"
          :value="index"
          :class="{ '-active': index === Number(selectedId) }"
        >
          {{ shadow?.name ?? $t('settings.style.shadows.shadow_id', { value: index }) }}
        </option>
      </Select>
      <div
        class="id-control arrange-buttons"
      >
        <button
          class="btn button-default"
          :disabled="shadowsAreNull"
          @click="add"
        >
          <FAIcon
            fixed-width
            icon="plus"
          />
        </button>
        <button
          class="btn button-default"
          :disabled="!moveUpValid"
          :class="{ disabled: !moveUpValid }"
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
          :class="{ disabled: !moveDnValid }"
          @click="moveDn"
        >
          <FAIcon
            fixed-width
            icon="chevron-down"
          />
        </button>
        <button
          class="btn button-default"
          :disabled="!present"
          :class="{ disabled: !present }"
          @click="del"
        >
          <FAIcon
            fixed-width
            icon="times"
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
          :value="selected?.name"
          :disabled="!present"
          :class="{ disabled: !present }"
          name="name"
          class="input input-string"
          @input="e => updateProperty('name', e.target.value)"
        >
      </div>
      <div
        :disabled="!present"
        class="inset-control style-control"
      >
        <Checkbox
          id="inset"
          :value="selected?.inset"
          :disabled="!present"
          name="inset"
          class="input-inset input-boolean"
          @input="e => updateProperty('inset', e.target.value)"
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
          :value="selected?.blur"
          :disabled="!present"
          :class="{ disabled: !present }"
          name="blur"
          class="input input-range"
          type="range"
          max="20"
          min="0"
          @input="e => updateProperty('blur', e.target.value)"
        >
        <input
          :value="selected?.blur"
          :disabled="!present"
          :class="{ disabled: !present }"
          class="input input-number"
          type="number"
          min="0"
          @input="e => updateProperty('blur', e.target.value)"
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
          :value="selected?.spread"
          :disabled="!present"
          :class="{ disabled: !present }"
          name="spread"
          class="input input-range"
          type="range"
          max="20"
          min="-20"
          @input="e => updateProperty('spread', e.target.value)"
        >
        <input
          :value="selected?.spread"
          :disabled="!present"
          :class="{ disabled: !present }"
          class="input input-number"
          type="number"
          @input="e => updateProperty('spread', e.target.value)"
        >
      </div>
      <ColorInput
        :modelValue="selected?.color"
        :disabled="!present"
        :label="$t('settings.style.common.color')"
        :fallback="currentFallback?.color"
        :show-optional-tickbox="false"
        name="shadow"
        @update:modelValue="e => updateProperty('color', e.target.value)"
      />
      <OpacityInput
        :modelValue="selected?.alpha"
        :disabled="!present"
        @update:modelValue="e => updateProperty('alpha', e.target.value)"
      />
      <i18n-t
        scope="global"
        keypath="settings.style.shadows.hintV3"
        :class="{ faint: !present }"
        tag="p"
      >
        <code>--variable,mod</code>
      </i18n-t>
      <Popover
        trigger="hover"
        v-if="separateInset"
      >
        <template #trigger>
          <div
            class="inset-alert alert warning"
          >
            <FAIcon icon="exclamation-triangle" />
            &nbsp;
            {{ $t('settings.style.shadows.filter_hint.avatar_inset_short') }}
          </div>
        </template>
        <template #content>
          <div class="inset-tooltip">
            <i18n-t
              scope="global"
              keypath="settings.style.shadows.filter_hint.always_drop_shadow"
              tag="p"
            >
              <code>filter: drop-shadow()</code>
            </i18n-t>
            <p>{{ $t('settings.style.shadows.filter_hint.avatar_inset') }}</p>
            <i18n-t
              scope="global"
              keypath="settings.style.shadows.filter_hint.drop_shadow_syntax"
              tag="p"
            >
              <code>drop-shadow</code>
              <code>spread-radius</code>
              <code>inset</code>
            </i18n-t>
            <i18n-t
              scope="global"
              keypath="settings.style.shadows.filter_hint.inset_classic"
              tag="p"
            >
              <code>box-shadow</code>
            </i18n-t>
            <p>{{ $t('settings.style.shadows.filter_hint.spread_zero') }}</p>
          </div>
        </template>
      </Popover>
    </div>
  </div>
</template>

<script src="./shadow_control.js"></script>

<style src="./shadow_control.scss" lang="scss"></style>
