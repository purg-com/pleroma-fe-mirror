<template>
  <button
    v-if="isLoggedIn"
    class="MobilePostButton button-default new-status-button"
    :class="{ 'hidden': isHidden, 'always-show': isPersistent }"
    :title="$t('post_status.new_status')"
    @click="openPostForm"
  >
    <FAIcon icon="pen" />
  </button>
</template>

<script src="./mobile_post_status_button.js"></script>

<style lang="scss">
.MobilePostButton {
  &.button-default {
    width: 5em;
    height: 5em;
    border-radius: 100%;
    position: fixed;
    bottom: 1.5em;
    right: 1.5em;
    // TODO: this needs its own color, it has to stand out enough and link color
    // is not very optimal for this particular use.
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 2px rgb(0 0 0 / 30%), 0 4px 6px rgb(0 0 0 / 30%);
    z-index: 10;
    transition: 0.35s transform;
    transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  }

  &.hidden {
    transform: translateY(150%);
  }

  svg {
    font-size: 1.5em;
    color: var(--text);
  }
}

@media all and (width >= 801px) {
  .new-status-button:not(.always-show) {
    display: none;
  }
}

</style>
