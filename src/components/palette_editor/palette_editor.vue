<template>
  <div class="PaletteEditor">
    <ColorInput
      v-for="key in paletteKeys"
      :key="key"
      :model-value="props.modelValue[key]"
      :fallback="fallback(key)"
      :label="$t('settings.style.themes3.palette.' + key)"
      @update:modelValue="value => updatePalette(key, value)"
    />
    <button
      class="btn button-default palette-import-button"
      @click="importPalette"
    >
      <FAIcon icon="file-import" />
      {{ $t('settings.style.themes3.palette.import') }}
    </button>
    <button
      class="btn button-default palette-export-button"
      @click="exportPalette"
    >
      <FAIcon icon="file-export" />
      {{ $t('settings.style.themes3.palette.export') }}
    </button>
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
  display: grid;
  justify-content: space-around;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr) auto;
  grid-gap: 0.5em;
  align-items: space-between;

  .palette-import-button {
    grid-column: 1 / span 2;
  }

  .palette-export-button {
    grid-column: 3 / span 2;
  }

  .color-input.style-control {
    margin: 0;
  }
}
</style>
