<template>
  <div
    v-if="allBookmarks"
    class="bookmark-folder-card"
  >
    <router-link
      :to="{ name: 'bookmarks' }"
      class="bookmark-folder-name"
    >
      <span class="icon">
        <FAIcon
          fixed-width
          class="fa-scale-110 menu-icon"
          icon="bookmark"
        />
      </span>{{ $t('nav.all_bookmarks') }}
    </router-link>
  </div>
  <div
    v-else
    class="bookmark-folder-card"
  >
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

a.bookmark-folder-name {
  display: flex;
  align-items: center;
  flex-grow: 1;

  .icon,
  .iconLetter,
  .iconEmoji {
    display: inline-block;
    height: 2.5rem;
    width: 2.5rem;
    margin-right: 0.5rem;
  }

  .icon,
  .iconLetter {
    font-size: 1.5rem;
    line-height: 2.5rem;
    text-align: center;
  }

  .iconEmoji {
    text-align: center;
    object-fit: contain;
    vertical-align: middle;

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
