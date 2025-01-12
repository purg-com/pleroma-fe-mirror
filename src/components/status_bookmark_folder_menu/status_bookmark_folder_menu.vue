<template>
  <div class="dropdown-menu">
    <button
      v-for="folder in folders"
      :key="folder.id"
      class="menu-item dropdown-item -icon"
      @click="toggleFolder(folder.id)"
    >
      <span
        class="input menu-checkbox -radio"
        :class="{ 'menu-checkbox-checked': status.bookmark_folder_id == folder.id }"
      />
      {{ folder.name }}
    </button>
  </div>
</template>

<script src="./status_bookmark_folder_menu.js"></script>
