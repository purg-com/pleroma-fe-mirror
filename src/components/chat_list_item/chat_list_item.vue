<template>
  <div
    class="chat-list-item"
    @click.capture.prevent="openChat"
  >
    <div class="chat-list-item-left">
      <UserAvatar
        :user="chat.account"
        height="48px"
        width="48px"
      />
    </div>
    <div class="chat-list-item-center">
      <div class="heading">
        <span
          v-if="chat.account"
          class="name-and-account-name"
        >
          <ChatTitle
            :user="chat.account"
          />
        </span>
        <span class="heading-right" />
        <div class="time-wrapper">
          <Timeago
            :time="chat.updated_at"
            :auto-update="60"
          />
        </div>
      </div>
      <div class="chat-preview">
        <StatusBody
          class="chat-preview-body"
          :status="messageForStatusContent"
          :single-line="true"
        />
        <div
          v-if="chat.unread > 0"
          class="badge -notification unread-chat-count"
        >
          {{ chat.unread }}
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./chat_list_item.js"></script>

<style src="./chat_list_item.scss" lang="scss" />
