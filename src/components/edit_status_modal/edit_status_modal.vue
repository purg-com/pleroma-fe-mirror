<template>
  <Modal
    v-if="isFormVisible"
    class="edit-form-modal-view"
    @backdrop-clicked="closeModal"
  >
    <div class="edit-form-modal-panel panel">
      <div class="panel-heading">
        <h1 class="title">
          {{ $t('post_status.edit_status') }}
        </h1>
      </div>
      <EditStatusForm
        ref="editStatusForm"
        class="panel-body"
        :params="params"
        @posted="doCloseModal"
        @draft-done="doCloseModal"
        @can-close="doCloseModal"
      />
    </div>
  </Modal>
</template>

<script src="./edit_status_modal.js"></script>

<style lang="scss">
.modal-view.edit-form-modal-view {
  align-items: flex-start;
}

.edit-form-modal-panel {
  flex-shrink: 0;
  margin-top: 25%;
  margin-bottom: 2em;
  width: 100%;
  max-width: 700px;

  @media (orientation: landscape) {
    margin-top: 8%;
  }

  .form-bottom-left {
    max-width: 6.5em;

    .emoji-icon {
      justify-content: right;
    }
  }
}
</style>
