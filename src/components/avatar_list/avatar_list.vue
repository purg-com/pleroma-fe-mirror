<template>
  <div class="avatars">
    <router-link
      v-for="user in slicedUsers"
      :key="user.id"
      :to="userProfileLink(user)"
      class="avatars-item"
    >
      <UserAvatar
        :user="user"
        class="avatar-small"
      />
    </router-link>
  </div>
</template>

<script src="./avatar_list.js"></script>

<style lang="scss">
.avatars {
  display: flex;
  margin: 0;
  padding: 0;

  // For hiding overflowing elements
  flex-wrap: wrap;
  height: 24px;

  .avatars-item {
    margin: 0 0 5px 5px;

    &:first-child {
      padding-left: 5px;
    }

    .avatar-small {
      border-radius: var(--roundness);
      height: 24px;
      width: 24px;
    }
  }
}
</style>
