<template>
  <div class="image-cropper">
    <div v-if="dataUrl">
      <cropper-canvas
        background
        class="image-cropper-canvas"
        ref="cropperCanvas"
        height="25em"
      >
        <cropper-image
          :src="dataUrl"
          alt="Picture"
          ref="cropperImage"
          class="image-cropper-image"
          translatable
          scalable
        />
        <cropper-shade hidden />
        <cropper-handle action="select" plain />
        <cropper-selection
          ref="cropperSelection"
          initial-coverage="1"
          aspect-ratio="1"
          movable
          resizable
          @change="onCropperSelectionChange"
        >
          <cropper-grid role="grid" covered></cropper-grid>
          <cropper-crosshair centered></cropper-crosshair>
          <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
          <cropper-handle action="n-resize"></cropper-handle>
          <cropper-handle action="e-resize"></cropper-handle>
          <cropper-handle action="s-resize"></cropper-handle>
          <cropper-handle action="w-resize"></cropper-handle>
          <cropper-handle action="ne-resize"></cropper-handle>
          <cropper-handle action="nw-resize"></cropper-handle>
          <cropper-handle action="se-resize"></cropper-handle>
          <cropper-handle action="sw-resize"></cropper-handle>
        </cropper-selection>
      </cropper-canvas>
      <div class="image-cropper-buttons-wrapper">
        <button
          class="button-default btn"
          type="button"
          :disabled="submitting"
          @click="submit()"
          v-text="saveText"
        />
        <button
          class="button-default btn"
          type="button"
          :disabled="submitting"
          @click="destroy"
          v-text="cancelText"
        />
        <button
          class="button-default btn"
          type="button"
          :disabled="submitting"
          @click="submit(false)"
          v-text="saveWithoutCroppingText"
        />
        <FAIcon
          v-if="submitting"
          spin
          icon="circle-notch"
        />
      </div>
    </div>
    <input
      ref="input"
      type="file"
      class="input image-cropper-img-input"
      :accept="mimes"
    >
  </div>
</template>

<script src="./image_cropper.js"></script>

<style lang="scss">
.image-cropper {
  &-img-input {
    display: none;
  }

  &-canvas {
    height: 25em;
    width: 25em;
  }

  &-buttons-wrapper {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 1fr 1fr 1fr;

    button {
      margin-top: 1em;
    }
  }
}
</style>
