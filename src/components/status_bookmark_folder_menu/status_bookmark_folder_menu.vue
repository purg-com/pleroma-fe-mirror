<template>
  <div class="dropdown-menu bookmark-folder-menu">
    <div
      v-for="folder in folders"
      :key="folder.id"
      class="menu-item dropdown-item -icon-double"
    >
      <button
        class="main-button"
        @click="toggleFolder(folder.id)"
        @click.stop="close"
      >
        <span
          class="input menu-checkbox -radio"
          :class="{ 'menu-checkbox-checked': status.bookmark_folder_id == folder.id }"
        />
        <StillImage :src="folder.emoji_url" class="emoji" />
        {{ ' ' + folder.name }}
      </button>
    </div>
  </div>
</template>

<script src="./status_bookmark_folder_menu.js"></script>
<style src="./status_bookmark_folder_menu.scss" />
