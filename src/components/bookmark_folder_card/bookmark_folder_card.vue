<template>
  <div class="bookmark-folder-card">
    <router-link
      :to="{ name: 'bookmark-folder', params: { id: folder.id } }"
      class="bookmark-folder-name"
    >
      <img
        v-if="folder.emoji_url"
        class="iconEmoji iconEmoji-image"
        :src="folder.emoji_url"
        :alt="folder.emoji"
        :title="folder.emoji"
      >
      <span
        v-else-if="folder.emoji"
        class="iconEmoji"
      >
        <span>
          {{ folder.emoji }}
        </span>
      </span>
      <span
        v-else-if="firstLetter"
        class="icon iconLetter fa-scale-110"
      >{{ firstLetter }}</span>{{ folder.name }}
    </router-link>
    <router-link
      :to="{ name: 'bookmark-folder-edit', params: { id: folder.id } }"
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
  align-items: center;
}

.bookmark-folder-name {
  flex-grow: 1;

  .iconLetter,
  .iconEmoji {
    margin-right: 0.5em;
  }

  .iconLetter {
    height: 2.5rem;
    width: 2.5rem;
    font-size: 1.5rem;
  }

  .iconEmoji {
    display: inline-block;
    text-align: center;
    object-fit: contain;
    vertical-align: middle;
    height: 2.5em;
    width: 2.5em;

    > span {
      font-size: 1.5rem;
      line-height: 2.5rem;
    }
  }

  img.iconEmoji {
    padding: 0.25em;
    box-sizing: border-box;
  }
}

.bookmark-folder-name,
.button-folder-edit {
  margin: 0;
  padding: 1em;
  color: var(--link);
}
</style>
