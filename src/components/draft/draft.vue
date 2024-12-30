<template>
  <article class="Draft">
    <div
      v-if="!editing"
      class="status-content"
    >
      <div>
        <i18n-t
          v-if="draft.type === 'reply' || draft.type === 'edit'"
          tag="span"
          :keypath="draft.type === 'reply' ? 'drafts.replying' : 'drafts.editing'"
        >
          <template #statusLink>
            <router-link
              class="faint-link"
              :to="{ name: 'conversation', params: { id: draft.refId } }"
            >
              {{ refStatus ? refStatus.external_url : $t('drafts.unavailable') }}
            </router-link>
          </template>
        </i18n-t>
        <StatusContent
          v-if="draft.refId && refStatus"
          class="status-content"
          :status="refStatus"
          :compact="true"
        />
      </div>
      <div class="status-preview">
        <p>{{ draft.status }}</p>
        <gallery
          v-if="draft.files?.length !== 0"
          class="attachments media-body"
          :compact="true"
          :nsfw="nsfwClickthrough"
          :attachments="draft.files"
          :limit="1"
          size="small"
          @play="$emit('mediaplay', attachment.id)"
          @pause="$emit('mediapause', attachment.id)"
        />
      </div>
    </div>
    <div v-if="editing">
      <PostStatusForm
        v-if="draft.type !== 'edit'"
        :disable-draft="true"
        v-bind="postStatusFormProps"
      />
      <EditStatusForm
        v-else
        :disable-draft="true"
        :params="postStatusFormProps"
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
    <div class="actions">
      <button
        class="btn button-default"
        :aria-expanded="editing"
        @click.prevent.stop="toggleEditing"
      >
        {{ editing ? $t('drafts.save') : $t('drafts.continue') }}
      </button>
      <button
        class="btn button-default"
        @click.prevent.stop="abandon"
      >
        {{ $t('drafts.abandon') }}
      </button>
    </div>
  </article>
</template>

<script src="./draft.js"></script>

<style lang="scss">
.Draft {
  position: relative;
  line-height: 1.1;
  font-size: initial;

  a {
    color: var(--link);
  }

  .status-content {
    padding: 0.5em;
    margin: 0.5em 0;
  }

  .status-preview {
    display: grid;
    grid-template-columns: 1fr 10em;
    grid-gap: 0.5em;
    max-width: 100%;

    p {
      word-wrap: break-word;
      white-space: normal;
      overflow-x: hidden;
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    .btn {
      flex: 1;
      margin-left: 1em;
      margin-right: 1em;
    }
  }
}
</style>
