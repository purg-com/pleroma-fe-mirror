<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h1 class="title">
        {{ $t('who_to_follow.who_to_follow') }}
      </h1>
    </div>
    <div class="panel-body">
      <FollowCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        class="list-item"
      />
    </div>
  </div>
</template>

<script src="./who_to_follow.js"></script>
