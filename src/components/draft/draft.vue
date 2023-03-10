<template>
  <article class="Draft">
    <div>
      {{ draft.id }}
    </div>
    <div v-if="draft.inReplyToStatusId">
      {{ draft.inReplyToStatusId }}
    </div>
    <div
      class="draft-content"
    >
      {{ draft.status }}
    </div>
    <div>
      <button
        class="btn button-default"
        :aria-expanded="editing"
        @click.prevent.stop="toggleEditing"
      >
        {{ $t('drafts.continue') }}
      </button>
    </div>
    <div v-if="editing">
      <PostStatusForm v-bind="postStatusFormProps" />
    </div>
  </article>
</template>

<script src="./draft.js"></script>

<style lang="scss">
.Draft {
  margin: 1em;
}
</style>
