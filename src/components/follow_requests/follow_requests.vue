<template>
  <div class="settings panel panel-default">
    <div class="panel-heading">
      <h1 class="title">
        {{ $t('nav.friend_requests') }}
      </h1>
    </div>
    <div class="panel-body">
      <FollowRequestCard
        v-for="request in requests"
        :key="request.id"
        :user="request"
        class="list-item"
      />
    </div>
  </div>
</template>

<script src="./follow_requests.js"></script>
