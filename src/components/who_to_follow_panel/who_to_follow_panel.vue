<template>
  <div class="who-to-follow-panel">
    <div class="panel panel-default base01-background">
      <div class="panel-heading timeline-heading base02-background base04">
        <h1 class="title">
          {{ $t('who_to_follow.who_to_follow') }}
        </h1>
      </div>
      <div class="who-to-follow">
        <p
          v-for="user in usersToFollow"
          :key="user.id"
          class="who-to-follow-items"
        >
          <img :src="user.img">
          <router-link :to="userProfileLink(user.id, user.name)">
            {{ user.name }}
          </router-link><br>
        </p>
        <p class="who-to-follow-more">
          <router-link :to="{ name: 'who-to-follow' }">
            {{ $t('who_to_follow.more') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script src="./who_to_follow_panel.js"></script>

<style lang="scss">
  .who-to-follow * {
    vertical-align: middle;
  }

  .who-to-follow img {
    width: 32px;
    height: 32px;
  }

  .who-to-follow {
    padding: 0 1em;
    margin: 0;
  }

  .who-to-follow-items {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0;
    margin: 1em 0;
  }

  .who-to-follow-more {
    padding: 0;
    margin: 1em 0;
    text-align: center;
  }
</style>
