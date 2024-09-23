<template>
  <div class="bookmark-folder-card">
    <router-link
      :to="{ name: 'bookmark-folder', params: { id: folder.id } }"
      class="bookmark-folder-name"
    >
      {{ folder.name }}
    </router-link>
    <router-link
      :to="{ name: 'bookmark-folder' /* -edit' */, params: { id: folder.id } }"
      class="button-folder-edit"
    >
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="ellipsis-h"
      />
    </router-link>
  </div>
</template>

<script src="./bookmark_folder_card.js"></script>

<style lang="scss">
.bookmark-folder-card {
  display: flex;
}

.bookmark-folder-name {
  flex-grow: 1;
}

.bookmark-folder-name,
.button-folder-edit {
  margin: 0;
  padding: 1em;
  color: var(--link);
}
</style>
