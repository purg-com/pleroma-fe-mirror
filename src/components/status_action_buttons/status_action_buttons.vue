<template>
</template>

<script src="./status_buttons.js"></script>

<style lang="scss">
@import "../../mixins";

.status-actions {
position: relative;
    width: 100%;
    display: flex;
    margin-top: var(--status-margin);

    > * {
      max-width: 4em;
      flex: 1;
    }
  }

</style>
