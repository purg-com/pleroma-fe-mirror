<template>
  <div class="terms-of-service-panel">
    <div class="panel panel-default">
      <div
        v-if="!embedded"
        class="panel-heading -sticky"
      >
        <div class="title">
          {{ $t("about.terms") }}
        </div>
      </div>
      <div class="panel-body">
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="tos-content"
          v-html="content"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </div>
  </div>
</template>

<script src="./terms_of_service_panel.js"></script>

<style lang="scss">
.tos-content {
  margin: 1em;
}

</style>
