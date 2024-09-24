<template>
  <div class="panel-default panel BookmarkFolderEdit">
    <div
      ref="header"
      class="panel-heading folder-edit-heading"
    >
      <button
        class="button-unstyled go-back-button"
        @click="$router.back"
      >
        <FAIcon
          size="lg"
          icon="chevron-left"
        />
      </button>
      <div class="title">
        <i18n-t
          v-if="id"
          keypath="bookmark_folders.editing_folder"
        >
          <template #folderName>
            {{ name }}
          </template>
        </i18n-t>
        <i18n-t
          v-else
          keypath="bookmark_folders.creating_folder"
        />
      </div>
    </div>
    <div class="panel-body">
      <div class="input-wrap">
        <label for="folder-edit-title">{{ $t('bookmark_folders.name') }}</label>
        {{ ' ' }}
        <input
          id="folder-edit-title"
          ref="name"
          v-model="nameDraft"
          class="input"
        >
        <button
          v-if="id"
          class="btn button-default follow-button"
          @click="updateFolder"
        >
          {{ $t('bookmark_folders.update_folder') }}
        </button>
      </div>
    </div>
    <div class="panel-footer">
      <span class="spacer" />
      <button
        v-if="!id"
        class="btn button-default footer-button"
        @click="createFolder"
      >
        {{ $t('bookmark_folders.create') }}
      </button>
      <button
        v-else-if="!reallyDelete"
        class="btn button-default footer-button"
        @click="reallyDelete = true"
      >
        {{ $t('bookmark_folders.delete') }}
      </button>
      <template v-else>
        {{ $t('bookmark_folders.really_delete') }}
        <button
          class="btn button-default footer-button"
          @click="deleteFolder"
        >
          {{ $t('general.yes') }}
        </button>
        <button
          class="btn button-default footer-button"
          @click="reallyDelete = false"
        >
          {{ $t('general.no') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script src="./bookmark_folder_edit.js"></script>

<style lang="scss">
.BookmarkFolderEdit {
  --panel-body-padding: 0.5em;

  overflow: hidden;
  display: flex;
  flex-direction: column;

  .folder-edit-heading {
    grid-template-columns: auto minmax(50%, 1fr);
  }

  .panel-body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .go-back-button {
    text-align: center;
    line-height: 1;
    height: 100%;
    align-self: start;
    width: var(--__panel-heading-height-inner);
  }

  .btn {
    margin: 0 0.5em;
  }

  .panel-footer {
    grid-template-columns: minmax(10%, 1fr);

    .footer-button {
      min-width: 9em;
    }
  }
}
</style>
