<template>
  <div class="features-panel">
    <div class="panel panel-default base01-background">
      <div class="panel-heading timeline-heading base02-background base04 -sticky">
        <h1 class="title">
          {{ $t('features_panel.title') }}
        </h1>
      </div>
      <div class="panel-body">
        <ul>
          <li v-if="shout">
            {{ $t('features_panel.shout') }}
          </li>
          <li v-if="pleromaChatMessages">
            {{ $t('features_panel.pleroma_chat_messages') }}
          </li>
          <li v-if="gopher">
            {{ $t('features_panel.gopher') }}
          </li>
          <li v-if="whoToFollow">
            {{ $t('features_panel.who_to_follow') }}
          </li>
          <li v-if="mediaProxy">
            {{ $t('features_panel.media_proxy') }}
          </li>
          <li>{{ $t('features_panel.scope_options') }}</li>
          <li>{{ $t('features_panel.text_limit') }} = {{ textlimit }}</li>
          <li>{{ $t('features_panel.upload_limit') }} = {{ uploadlimit.num }} {{ $t('upload.file_size_units.' + uploadlimit.unit) }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="./features_panel.js"></script>

<style lang="scss">
  .features-panel li {
    line-height: 24px;
  }
</style>
