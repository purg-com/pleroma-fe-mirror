<template>
  <div class="StatusBookmarkFolderMenu">
    <Popover
      trigger="hover"
      placement="left"
      remove-padding
    >
      <template #content>
        <div class="dropdown-menu">
          <button
            v-for="folder in folders"
            :key="folder.id"
            class="menu-item dropdown-item"
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
      <template #trigger>
        <button class="menu-item dropdown-item dropdown-item-icon -has-submenu">
          <FAIcon
            fixed-width
            icon="folder"
          />{{ $t('bookmark_folders.select_folder') }}<FAIcon
            class="chevron-icon"
            size="lg"
            icon="chevron-right"
          />
        </button>
      </template>
    </Popover>
  </div>
</template>

<script src="./status_bookmark_folder_menu.js"></script>
