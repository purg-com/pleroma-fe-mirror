<template>
  <video
    class="video"
    preload="metadata"
    :src="attachment.url + '#t=0.00000000000001'"
    :loop="loopVideo"
    :controls="controls"
    :alt="attachment.description"
    :title="attachment.description"
    playsinline
    @playing="onPlaying"
    @pause="onPaused"
  />
</template>

<script src="./video_attachment.js"></script>
