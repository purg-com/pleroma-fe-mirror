<template>
  <div class="dropdown-menu">
    <div
      v-for="folder in folders"
      :key="folder.id"
      class="menu-item dropdown-item -icon"
    >
      <button
        class="main-button"
        @click="toggleFolder(folder.id)"
      >
        <span
          class="input menu-checkbox -radio"
          :class="{ 'menu-checkbox-checked': status.bookmark_folder_id == folder.id }"
        />
        {{ folder.name }}
      </button>
    </div>
  </div>
</template>

<script src="./status_bookmark_folder_menu.js"></script>
