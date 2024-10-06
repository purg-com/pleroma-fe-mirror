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
        @click="exportStyle"
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
    <tab-switcher>
      <div
        key="component"
        class="setting-item component-editor"
        :label="$t('settings.style.themes3.editor.component_tab')"
      >
        <div class="component-selector">
          <label for="component-selector">
            {{ $t('settings.style.themes3.editor.component_selector') }}
            {{ ' ' }}
          </label>
          <Select
            id="component-selector"
            v-model="selectedComponentKey"
          >
            <option
              v-for="key in componentKeys"
              :key="'component-' + key"
              :value="key"
            >
              {{ componentsMap.get(key).name }}
            </option>
          </Select>
        </div>
        <div
          v-if="selectedComponentVariantsAll.length > 1"
          class="variant-selector"
        >
          <label for="variant-selector">
            {{ $t('settings.style.themes3.editor.variant_selector') }}
          </label>
          <Select
            v-model="selectedVariant"
          >
            <option
              v-for="variant in selectedComponentVariantsAll"
              :key="'component-variant-' + variant"
              :value="variant"
            >
              {{ variant }}
            </option>
          </Select>
        </div>
        <div
          v-if="selectedComponentStates.length > 0"
          class="state-selector"
        >
          <label>
            {{ $t('settings.style.themes3.editor.states_selector') }}
          </label>
          <ul
            class="state-selector-list"
          >
            <li
              v-for="state in selectedComponentStates"
              :key="'component-state-' + state"
            >
              <Checkbox
                :value="selectedState.has(state)"
                @update:modelValue="(v) => updateSelectedStates(state, v)"
              >
                {{ state }}
              </Checkbox>
            </li>
          </ul>
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
            :show-text="componentHas('Text')"
            :shadow-control="isShadowTabOpen"
            :preview-class="previewClass"
            :preview-style="editorHintStyle"
            :disabled="!editedSubShadow && typeof editedShadow !== 'string'"
            :shadow="editedSubShadow"
            @update:shadow="({ axis, value }) => updateSubShadow(axis, value)"
          />
        </div>
        <tab-switcher
          ref="tabSwitcher"
          class="component-settings"
          :on-switch="onTabSwitch"
        >
          <div
            key="main"
            class="editor-tab"
            :label="$t('settings.style.themes3.editor.main_tab')"
          >
            <ColorInput
              v-model="editedBackgroundColor"
              :disabled="!isBackgroundColorPresent"
              :label="$t('settings.style.themes3.editor.background')"
            />
            <Tooltip :text="$t('settings.style.themes3.editor.include_in_rule')">
              <Checkbox v-model="isBackgroundColorPresent" />
            </Tooltip>
            <OpacityInput
              v-model="editedOpacity"
              :disabled="!isOpacityPresent"
              :label="$t('settings.style.themes3.editor.opacity')"
            />
            <Tooltip :text="$t('settings.style.themes3.editor.include_in_rule')">
              <Checkbox v-model="isOpacityPresent" />
            </Tooltip>
            <ColorInput
              v-if="componentHas('Text')"
              v-model="editedTextColor"
              :label="$t('settings.style.themes3.editor.text_color')"
              :disabled="!isTextColorPresent"
            />
            <Tooltip
              v-if="componentHas('Text')"
              :text="$t('settings.style.themes3.editor.include_in_rule')"
            >
              <Checkbox v-model="isTextColorPresent" />
            </Tooltip>
            <div class="style-control suboption">
              <label
                for="textAuto"
                class="label"
                :class="{ faint: !isTextAutoPresent }"
              >
                {{ $t('settings.style.themes3.editor.text_auto.label') }}
              </label>
              <Select
                id="textAuto"
                v-model="editedTextAuto"
                :disabled="!isTextAutoPresent"
              >
                <option value="no-preserve">
                  {{ $t('settings.style.themes3.editor.text_auto.no-preserve') }}
                </option>
                <option value="no-auto">
                  {{ $t('settings.style.themes3.editor.text_auto.no-auto') }}
                </option>
                <option value="preserve">
                  {{ $t('settings.style.themes3.editor.text_auto.preserve') }}
                </option>
              </Select>
            </div>
            <Tooltip
              v-if="componentHas('Text')"
              :text="$t('settings.style.themes3.editor.include_in_rule')"
            >
              <Checkbox v-model="isTextAutoPresent" />
            </Tooltip>
            <div>
              <ContrastRatio :contrast="getContrast(editedBackgroundColor, editedTextColor)" />
            </div>
            <div>
              <!-- spacer for missing checkbox -->
            </div>
            <ColorInput
              v-if="componentHas('Link')"
              v-model="editedLinkColor"
              :label="$t('settings.style.themes3.editor.link_color')"
              :disabled="!isLinkColorPresent"
            />
            <Tooltip
              v-if="componentHas('Link')"
              :text="$t('settings.style.themes3.editor.include_in_rule')"
            >
              <Checkbox v-model="isLinkColorPresent" />
            </Tooltip>
            <ColorInput
              v-if="componentHas('Icon')"
              v-model="editedIconColor"
              :label="$t('settings.style.themes3.editor.icon_color')"
              :disabled="!isIconColorPresent"
            />
            <Tooltip
              v-if="componentHas('Icon')"
              :text="$t('settings.style.themes3.editor.include_in_rule')"
            >
              <Checkbox v-model="isIconColorPresent" />
            </Tooltip>
          </div>
          <div
            key="shadow"
            class="editor-tab shadow-tab"
            :label="$t('settings.style.themes3.editor.shadows_tab')"
          >
            <Checkbox
              v-model="isShadowPresent"
              class="style-control"
            >
              {{ $t('settings.style.themes3.editor.include_in_rule') }}
            </checkbox>
            <ShadowControl
              v-model="editedShadow"
              :disabled="!isShadowPresent"
              :no-preview="true"
              :separate-inset="shadowSelected === 'avatar' || shadowSelected === 'avatarStatus'"
              @subShadowSelected="onSubShadow"
            />
          </div>
        </tab-switcher>
      </div>
      <div
        key="palette"
        :label="$t('settings.style.themes3.editor.palette_tab')"
        class="setting-item palette-editor"
      >
          <label
            class="palette-selector-label"
            for="palette-selector"
          >
            {{ $t('settings.style.themes3.palette.label') }}
            {{ ' ' }}
          </label>
          <Select
            id="palette-selector"
            v-model="editedPalette"
            class="palette-list"
            size="9"
          >
            <option
              v-for="(p, index) in palettes"
              :key="p.name"
              :value="index"
            >
              {{ p.name }}
            </option>
          </Select>
          <SelectMotion
            class="palette-list-movement"
            v-model="palettes"
            :selected-id="editedPalette"
            :get-add-value="getNewPalette"
            @update:selectedId="e => editedPalette = e"
          />
        <PaletteEditor
          class="palette-editor-edit"
          v-model="palette"
        />
      </div>
    </tab-switcher>
  </div>
</template>

<style src="./style_tab.scss" lang="scss"></style>
