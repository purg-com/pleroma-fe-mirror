<template>
  <div
    class="panel-default panel chat-new"
  >
    <div
      ref="header"
      class="panel-heading"
    >
      <button
        class="button-unstyled go-back-button"
        @click="goBack"
      >
        <FAIcon
          size="lg"
          icon="chevron-left"
        />
      </button>
    </div>
    <div class="panel-body">
      <div class="input-wrap">
        <div class="input-search">
          <FAIcon
            class="search-icon fa-scale-110 fa-old-padding"
            icon="search"
          />
        </div>
        <input
          ref="search"
          v-model="query"
          class="input"
          placeholder="Search people"
          @input="onInput"
        >
      </div>
      <div class="member-list">
        <div
          v-for="user in availableUsers"
          :key="user.id"
          class="list-item"
          @click.capture.prevent="goToChat(user)"
        >
          <BasicUserCard :user="user" />
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./chat_new.js"></script>

<style src="./chat_new.scss" lang="scss" />
