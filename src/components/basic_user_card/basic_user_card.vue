<template>
  <div class="basic-user-card">
    <router-link
      :to="userProfileLink(user)"
      @click.prevent
    >
      <UserPopover
        :user-id="user.id"
        :overlay-centers="true"
        overlay-centers-selector=".avatar"
      >
        <UserAvatar
          class="user-avatar avatar"
          :user="user"
          @click.prevent
        />
      </UserPopover>
    </router-link>
    <div
      class="basic-user-card-collapsed-content"
    >
      <div
        :title="user.name"
        class="basic-user-card-user-name"
      >
        <RichContent
          class="basic-user-card-user-name-value"
          :html="user.name"
          :emoji="user.emoji"
        />
      </div>
      <div>
        <user-link
          class="basic-user-card-screen-name"
          :user="user"
        />
      </div>
      <slot />
    </div>
  </div>
</template>

<script src="./basic_user_card.js"></script>

<style lang="scss">
.basic-user-card {
  display: flex;
  flex: 1 0;
  margin: 0;

  --emoji-size: 1em;

  &-collapsed-content {
    margin-left: 0.7em;
    text-align: left;
    flex: 1;
    min-width: 0;
  }

  &-user-name {
    img {
      object-fit: contain;
      height: 16px;
      width: 16px;
      vertical-align: middle;
    }
  }

  &-user-name-value,
  &-screen-name {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-expanded-content {
    flex: 1;
    margin-left: 0.7em;
    min-width: 0;
  }
}
</style>
