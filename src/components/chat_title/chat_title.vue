<template>
  <div
    class="chat-title"
    :title="title"
  >
    <UserPopover
      v-if="withAvatar && user"
      class="avatar-container"
      :user-id="user.id"
    >
      <UserAvatar
        class="titlebar-avatar"
        :user="user"
      />
    </UserPopover>
    <RichContent
      v-if="user"
      class="username"
      :title="'@'+(user && user.screen_name_ui)"
      :html="htmlTitle"
      :emoji="user.emoji || []"
    />
  </div>
</template>

<script src="./chat_title.js"></script>

<style lang="scss">
.chat-title {
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  --emoji-size: 1em;

  .username {
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline;
    word-wrap: break-word;
    overflow: hidden;
  }

  .avatar-container {
    align-self: center;
    line-height: 1;
  }

  .titlebar-avatar {
    margin-right: 0.5em;
    height: 1.5em;
    width: 1.5em;
    border-radius: var(--roundness);

    &.animated::before {
      display: none;
    }
  }
}
</style>
