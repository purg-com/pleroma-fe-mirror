<template>
  <ul>
    <NavigationEntry
      :item="{
        name: 'bookmarks',
        routeObject: { name: 'bookmarks' },
        label: 'nav.all_bookmarks',
        icon: 'bookmark'
      }"
    />
    <NavigationEntry
      v-for="item in folders"
      :key="item.id"
      :item="item"
    />
  </ul>
</template>

<script src="./bookmark_folders_menu_content.js"></script>
