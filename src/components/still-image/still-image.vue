<template>
  <div
    class="still-image"
    :class="{ animated: animated }"
    :style="style"
  >
    <canvas
      v-if="animated"
      ref="canvas"
    />
    <!-- NOTE: key is required to force to re-render img tag when src is changed -->
    <img
      ref="src"
      :key="realSrc"
      :alt="alt"
      :title="alt"
      :data-src="dataSrc"
      :src="realSrc"
      :referrerpolicy="referrerpolicy"
      :loading="loading"
      @load="onLoad"
      @error="onError"
    >
    <slot />
  </div>
</template>

<script src="./still-image.js"></script>

<style lang="scss">
.still-image {
  position: relative;
  line-height: 0;
  overflow: hidden;
  display: inline-flex;
  align-items: center;

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    visibility: var(--_still-image-canvas-visibility, visible);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &.animated {
    &::before {
      zoom: var(--_still_image-label-scale, 1);
      content: "gif";
      position: absolute;
      line-height: 1;
      font-size: 0.7em;
      top: 0.5em;
      left: 0.5em;
      background: rgb(127 127 127 / 50%);
      color: #fff;
      display: block;
      padding: 2px 4px;
      border-radius: var(--roundness);
      z-index: 2;
      visibility: var(--_still-image-label-visibility, visible);
    }

    &:hover canvas {
      display: none;
    }

    &:hover::before {
      visibility: var(--_still-image-label-visibility, hidden);
    }

    img {
      visibility: var(--_still-image-img-visibility, hidden);
    }

    &:hover img {
      visibility: visible;
    }
  }
}
</style>
