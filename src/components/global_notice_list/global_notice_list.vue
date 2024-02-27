<template>
  <div class="global-notice-list">
    <div
      v-for="(notice, index) in notices"
      :key="index"
      class="alert global-notice"
      :class="{ [notice.level]: true }"
    >
      <div class="notice-message">
        {{ $t(notice.messageKey, notice.messageArgs) }}
      </div>
      <button
        class="button-unstyled close-notice"
        @click="closeNotice(notice)"
      >
        <FAIcon
          class="fa-scale-110 fa-old-padding"
          icon="times"
        />
      </button>
    </div>
  </div>
</template>

<script src="./global_notice_list.js"></script>

<style lang="scss">
@import "../../variables";

.global-notice-list {
  position: fixed;
  top: calc(var(--navbar-height) + 0.5em);
  width: 100%;
  pointer-events: none;
  z-index: var(--ZI_modals_popovers);
  display: flex;
  flex-direction: column;
  align-items: center;

  .global-notice {
    pointer-events: auto;
    text-align: center;
    width: 40em;
    max-width: calc(100% - 3em);
    display: flex;
    padding-left: 1.5em;
    line-height: 2;
    margin-bottom: 0.5em;

    .notice-message {
      flex: 1 1 100%;
    }
  }

  .close-notice {
    padding-right: 0.2em;
  }
}
</style>
