<template>
  <div class="Bookmark-folders panel panel-default">
    <div class="panel-heading">
      <div class="title">
        {{ $t('nav.bookmark_folders') }}
      </div>
      <router-link
        :to="{ name: 'bookmark-folder-new' }"
        class="button-default btn new-folder-button"
      >
        {{ $t("bookmark_folders.new") }}
      </router-link>
    </div>
    <div class="panel-body">
      <BookmarkFolderCard
        :all-bookmarks="true"
        class="list-item"
      />
      <BookmarkFolderCard
        v-for="folder in bookmarkFolders.slice().reverse()"
        :key="folder"
        :folder="folder"
        class="list-item"
      />
    </div>
  </div>
</template>

<script src="./bookmark_folders.js"></script>

<style lang="scss">
.Bookmark-folders {
  .new-folder-button {
    padding: 0 0.5em;
  }
}
</style>
