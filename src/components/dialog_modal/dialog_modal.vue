<template>
  <span
    class="dialog-container"
    :class="{ 'dark-overlay': darkOverlay }"
    @click.self.stop="onCancel()"
  >
    <div
      class="dialog-modal panel panel-default"
      @click.stop=""
    >
      <div class="panel-heading dialog-modal-heading">
        <h1 class="title">
          <slot name="header" />
        </h1>
      </div>
      <div class="panel-body dialog-modal-content">
        <slot name="default" />
      </div>
      <div class="dialog-modal-footer user-interactions panel-footer">
        <slot name="footer" />
      </div>
    </div>
  </span>
</template>

<script src="./dialog_modal.js"></script>

<style lang="scss">
// TODO: unify with other modals.
.dark-overlay {
  &::before {
    bottom: 0;
    content: " ";
    display: block;
    cursor: default;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    background: rgb(27 31 35 / 50%);
    z-index: 2000;
  }
}

.dialog-container {
  display: grid;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  align-items: center;
  justify-items: center;
}

.dialog-modal.panel {
  max-height: 80vh;
  max-width: 90vw;
  z-index: 2001;
  cursor: default;
  display: block;

  .dialog-modal-heading {
    .title {
      text-align: center;
    }
  }

  .dialog-modal-content {
    margin: 0;
    padding: 1rem;
    white-space: normal;
    text-align: center;
  }

  .dialog-modal-footer {
    margin: 0;
    padding: 0.5em;
    border-top: 1px solid var(--border);
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: min-content;
    grid-auto-columns: min-content;
    grid-auto-flow: column dense;
    height: auto;

    button {
      width: auto;
      white-space: nowrap;
      padding-left: 2em;
      padding-right: 2em;
    }
  }
}

#modal.-mobile {
  .dialog-container {
    justify-content: stretch;
    align-items: end;
    justify-items: stretch;
  }

  .dialog-modal.panel {
    min-width: 100vw;
  }

  .dialog-modal-footer {
    flex-direction: column;
    justify-content: flex-end;
    grid-template-columns: 1fr;
    grid-auto-columns: none;
    grid-auto-rows: auto;
    grid-auto-flow: row dense;

    button {
      grid-column: 1;
      height: 2em;
    }
  }
}

</style>
