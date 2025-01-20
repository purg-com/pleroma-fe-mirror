<template>
  <div class="list-card">
    <router-link
      :to="{ name: 'lists-timeline', params: { id: list.id } }"
      class="list-name"
    >
      {{ list.title }}
    </router-link>
    <router-link
      :to="{ name: 'lists-edit', params: { id: list.id } }"
      class="button-list-edit"
    >
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="ellipsis-h"
      />
    </router-link>
  </div>
</template>

<script src="./lists_card.js"></script>

<style lang="scss">
.list-card {
  display: flex;
}

.list-name {
  flex-grow: 1;
}

.list-name,
.button-list-edit {
  margin: 0;
  padding: 1em;
  color: var(--link);
}
</style>
