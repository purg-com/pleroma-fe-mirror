<template>
  <div class="PaletteEditor">
    <div class="colors">
      <ColorInput
        v-for="key in paletteKeys"
        :key="key"
        :model-value="props.modelValue[key]"
        :fallback="fallback(key)"
        :label="$t('settings.style.themes3.palette.' + key)"
        @update:modelValue="value => updatePalette(key, value)"
      />
    </div>
    <div class="controls">
      <button
        class="btn button-default"
        @click="importPalette"
      >
        <FAIcon icon="file-import" />
        {{ $t('settings.style.themes3.palette.import') }}
      </button>
      <button
        class="btn button-default"
        @click="exportPalette"
      >
        <FAIcon icon="file-export" />
        {{ $t('settings.style.themes3.palette.export') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import ColorInput from 'src/components/color_input/color_input.vue'
import {
  // newImporter,
  newExporter
} from 'src/services/export_import/export_import.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFileImport,
  faFileExport
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faFileImport,
  faFileExport
)

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const paletteExporter = newExporter({
  filename: 'pleroma.palette.json',
  getExportedObject: () => props.modelValue
})
/*
   const themeImporter = newImporter({
     validator: importValidator,
     onImport,
     onImportFailure,
   })
*/

const exportPalette = () => {
  paletteExporter.exportData()
}

const importPalette = () => {
  // TODO
}

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
    return '#008080'
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
  .colors {
    display: grid;
    justify-content: space-around;
    grid-template-columns: repeat(4, min-content);
    grid-template-rows: repeat(auto-fit, min-content);
    grid-gap: 0.5em;
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5em;
  }
}
</style>
