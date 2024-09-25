<script src="./style_tab.js">
</script>

<template>
  <div class="StyleTab">
    <div class="setting-item heading">
      <h2>{{ $t('settings.style.themes3.editor.title') }}</h2>
      <button
        class="btn button-default"
        @click="clearTheme"
      >
        <FAIcon icon="file" />
        {{ $t('settings.style.themes3.editor.new_style') }}
      </button>
      <button
        class="btn button-default"
        @click="importStyle"
      >
        <FAIcon icon="folder-open" />
        {{ $t('settings.style.themes3.editor.load_style') }}
      </button>
      <button
        class="btn button-default"
        @click="exportTheme"
      >
        <FAIcon icon="floppy-disk" />
        {{ $t('settings.style.themes3.editor.save_style') }}
      </button>
    </div>
    <div class="setting-item metadata">
      <ul class="setting-list">
        <li>
          <StringSetting v-model="name">
            {{ $t('settings.style.themes3.editor.style_name') }}
          </StringSetting>
        </li>
        <li>
          <StringSetting v-model="author">
            {{ $t('settings.style.themes3.editor.style_author') }}
          </StringSetting>
        </li>
        <li>
          <StringSetting v-model="license">
            {{ $t('settings.style.themes3.editor.style_license') }}
          </StringSetting>
        </li>
        <li>
          <StringSetting v-model="website">
            {{ $t('settings.style.themes3.editor.style_website') }}
          </StringSetting>
        </li>
      </ul>
    </div>
    <div class="setting-item component-editor">
      <label
        for="component-selector"
        class="component-selector-label"
      >
        {{ $t('settings.style.themes3.editor.component_selector') }}
        {{ ' ' }}
      </label>
      <Select
        v-model="selectedComponentKey"
        id="component-selector"
        class="component-selector"
      >
        <option
          v-for="key in componentKeys"
          :key="'component-' + key"
          :value="key"
        >
          {{ fallbackI18n($t(getFriendlyNamePath(componentsMap.get(key).name)), componentsMap.get(key).name) }}
        </option>
      </Select>
        <label
          for="component-selector"
          class="component-selector-label"
        >
          {{ $t('settings.style.themes3.editor.component_selector') }}
        </label>
      <div class="variant-selector">
        <label for="variant-selector">
          {{ $t('settings.style.themes3.editor.variant_selector') }}
        </label>
        <Select
          v-if="selectedComponentVariantsAll.length > 1"
          v-model="selectedVariant"
        >
          <option
            v-for="variant in selectedComponentVariantsAll"
            :value="variant"
            :key="'component-variant-' + variant"
          >
            {{ fallbackI18n($t(getVariantPath(selectedComponentName, variant)), variant)  }}
          </option>
        </Select>
        <div v-else>
          {{ $t('settings.style.themes3.editor.only_variant') }}
        </div>
      </div>
      <div class="state-selector">
        <label for="variant-selector">
          {{ $t('settings.style.themes3.editor.states_selector') }}
        </label>
        <ul
          v-if="selectedComponentStates.length > 0"
          class="state-selector-list"
          >
          <li
            v-for="state in selectedComponentStates"
            :key="'component-variant-' + state"
            >
            <Checkbox
              :value="selectedStates.has(state)"
                @update:modelValue="(v) => updateSelectedStates(state, v)"
              >
              {{ fallbackI18n($t(getStatePath(selectedComponentName, state)), state)  }}
            </Checkbox>
          </li>
        </ul>
        <div v-else>
          {{ $t('settings.style.themes3.editor.only_state') }}
        </div>
      </div>
      <div class="preview-container">
        <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
        <component
          :is="'style'"
          v-html="previewCss"
        />
        <!-- eslint-enable vue/no-v-html vue/no-v-text-v-html-on-component -->
        <ComponentPreview
          class="component-preview"
          :previewClass="previewClass"
          :previewStyle="editorHintStyle"
          @update:shadow="({ axis, value }) => updateProperty(axis, value)"
        />
      </div>
      <tab-switcher
        ref="tabSwitcher"
        class="component-settings"
        :on-switch="onTabSwitch"
      >
        <div
          class="editor-tab"
          :label="$t('settings.style.themes3.editor.main_tab')"
          :data-tab-name="main"
        >
          lol
        </div>
        <div
          class="editor-tab"
          :label="$t('settings.style.themes3.editor.shadows_tab')"
          :data-tab-name="shadow"
        >
          <ShadowControl
            v-model="editedShadow"
            :no-preview="true"
            :separate-inset="shadowSelected === 'avatar' || shadowSelected === 'avatarStatus'"
            :fallback="currentShadowFallback"
          />
        </div>
      </tab-switcher>
    </div>
  </div>
</template>

<style src="./style_tab.scss" lang="scss"></style>
