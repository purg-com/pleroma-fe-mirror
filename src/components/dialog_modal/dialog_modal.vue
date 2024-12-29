<template>
  <span
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

.dialog-modal.panel {
  top: 0;
  left: 50%;
  max-height: 80vh;
  max-width: 90vw;
  margin: 15vh auto;
  position: fixed;
  transform: translateX(-50%);
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
  }

  .dialog-modal-footer {
    margin: 0;
    padding: 0.5em;
    border-top: 1px solid var(--border);
    display: grid;
    grid-gap: 0.5em;
    grid-auto-columns: minmax(max-content, 1fr);
    height: auto;

    button {
      width: auto;
      padding-left: 2em;
      padding-right: 2em;
    }
  }
}

#modal.-mobile {
  .dialog-modal.panel {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: none;
    transform: none;
    width: 100vw;
    margin: auto;
    z-index: 2001;

    .dialog-modal-footer {
      flex-direction: column;
      justify-content: flex-end;
      grid-auto-columns: initial;
      grid-auto-rows: 1fr;

      button {
        grid-column: 1;
        height: 2em;
      }
    }
  }
}

</style>
