<template>
  <Popover
    ref="popover"
    trigger="hover"
    :stay-on-click="true"
    popover-class="popover-default status-popover"
    :bound-to="{ x: 'container' }"
    @show="enter"
  >
    <template #trigger>
      <slot />
    </template>
    <template #content>
      <Status
        v-if="status"
        :is-preview="true"
        :statusoid="status"
        :compact="true"
      />
      <div
        v-else-if="error"
        class="status-preview-no-content faint"
      >
        {{ $t('status.status_unavailable') }}
      </div>
      <div
        v-else
        class="status-preview-no-content"
      >
        <FAIcon
          icon="circle-notch"
          spin
          size="2x"
        />
      </div>
    </template>
  </Popover>
</template>

<script src="./status_popover.js"></script>

<style lang="scss">
/* popover styles load on-demand, so we need to override */
.status-popover.popover {
  font-size: 1rem;
  min-width: 15em;
  max-width: 95%;
  border-color: var(--border);
  border-style: solid;
  border-width: 1px;

  /* TODO cleanup this */
  .Status.Status {
    border: none;
  }

  .status-preview-no-content {
    padding: 1em;
    text-align: center;

    i {
      font-size: 2em;
    }
  }
}

</style>
