<template>
  <article class="Draft">
    <div v-if="draft.inReplyToStatusId">
      {{ draft.inReplyToStatusId }}
    </div>
    <div class="actions">
      <button
        class="btn button-default"
        :class="{ toggled: editing }"
        :aria-expanded="editing"
        @click.prevent.stop="toggleEditing"
      >
        {{ $t('drafts.continue') }}
      </button>
      <button
        class="btn button-default"
        @click.prevent.stop="abandon"
      >
        {{ $t('drafts.abandon') }}
      </button>
    </div>
    <p
      v-if="!editing"
      class="draft-content"
    >
      {{ draft.status }}
    </p>
    <div v-if="editing">
      <PostStatusForm
        v-bind="postStatusFormProps"
        @posted="handlePosted"
      />
    </div>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmDialog"
        :title="$t('drafts.abandon_confirm_title')"
        :confirm-text="$t('drafts.abandon_confirm_accept_button')"
        :cancel-text="$t('drafts.abandon_confirm_cancel_button')"
        @accepted="doAbandon"
        @cancelled="hideConfirmDialog"
      >
        {{ $t('drafts.abandon_confirm') }}
      </confirm-modal>
    </teleport>
  </article>
</template>

<script src="./draft.js"></script>

<style lang="scss">
.Draft {
  margin: 1em;

  .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    .btn {
      flex: 1;
      margin-left: 1em;
      margin-right: 1em;
      max-width: 10em;
    }
  }
}
</style>
