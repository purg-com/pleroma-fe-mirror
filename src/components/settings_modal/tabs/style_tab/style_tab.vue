<script setup>
import { ref, computed } from 'vue'

import Select from 'src/components/select/select.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import StringSetting from '../../helpers/string_setting.vue'
// import Preview from '../theme_tab/theme_preview.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFloppyDisk, faFolderOpen, faFile } from '@fortawesome/free-solid-svg-icons'

library.add(
  faFile,
  faFloppyDisk,
  faFolderOpen
)

const name = ref('')
const author = ref('')
const license = ref('')
const website = ref('')

// Getting existing components
const componentsContext = require.context('src', true, /\.style.js(on)?$/)
const componentKeys = componentsContext.keys()

const componentsMap = new Map(
  componentKeys
    .map(
      key => [key, componentsContext(key).default]
    )
)
// const componentValues = componentsMap.values()

// Initializing selected component and its computed descendants
const selectedComponentKey = ref(componentKeys[0])
const selectedComponentValue = computed(() => componentsMap.get(selectedComponentKey.value))

// const selectedComponentName = computed(() => selectedComponent.value.name)
const selectedComponentVariants = computed(() => {
  return new Set([...(Object.keys(selectedComponentValue.value.variants || {})), 'normal'])
})
const selectedComponentStates = computed(() => {
  return new Set([...(Object.keys(selectedComponentValue.value.states || {})), 'normal'])
})

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
    <div class="setting-item">
      <Select v-model="selectedComponentKey">
        <option
          v-for="key in componentKeys"
          :key="'component-' + key"
          :value="key"
        >
          {{ componentsMap.get(key).name }}
        </option>
      </Select>
      <div class="component-editor">
        <Select
          v-model="selectedComponentVariant"
          class="variant-selector"
        >
          <option
            v-for="variant in selectedComponentVariants"
            :key="'component-variant-' + variant"
          >
            {{ variant }}
          </option>
        </Select>
        <ul class="state-selector">
          <li
            v-for="state in selectedComponentStates"
            :key="'component-variant-' + state"
          >
            <Checkbox
              v-model="selectedComponentStates"
            >
                {{ state }}
            </Checkbox>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style src="./style_tab.scss" lang="scss"></style>
