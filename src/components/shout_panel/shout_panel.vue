<template>
  <div
    v-if="!collapsed || !floating"
    class="shout-panel"
  >
    <div class="panel panel-default">
      <div
        class="panel-heading"
        :class="{ 'shout-heading': floating }"
        @click.stop.prevent="togglePanel"
      >
        <h1 class="title">
          {{ $t('shoutbox.title') }}
          <FAIcon
            v-if="floating"
            icon="times"
            class="close-icon"
          />
        </h1>
      </div>
      <div class="panel-body shout-window">
        <div
          v-for="message in messages"
          :key="message.id"
          class="shout-message"
        >
          <span class="shout-avatar">
            <img :src="message.author.avatar">
          </span>
          <div class="shout-content">
            <router-link
              class="shout-name"
              :to="userProfileLink(message.author)"
            >
              {{ message.author.username }}
            </router-link>
            <br>
            <span class="shout-text">
              {{ message.text }}
            </span>
          </div>
        </div>
      </div>
      <div class="panel-body shout-input">
        <textarea
          v-model="currentMessage"
          class="shout-input-textarea input"
          rows="1"
          @keyup.enter="submit(currentMessage)"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="shout-panel"
  >
    <div class="panel panel-default">
      <div
        class="panel-heading -stub timeline-heading shout-heading"
        @click.stop.prevent="togglePanel"
      >
        <div class="title">
          <FAIcon
            class="icon"
            icon="bullhorn"
          />
          {{ $t('shoutbox.title') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./shout_panel.js"></script>

<style lang="scss">
.floating-shout {
  position: fixed;
  bottom: 0.5em;
  z-index: var(--ZI_popovers);
  max-width: 25em;

  &.-left {
    left: 0.5em;
  }

  &:not(.-left) {
    right: 0.5em;
  }
}

.shout-panel {
  .shout-heading {
    cursor: pointer;

    .icon {
      color: var(--text);
      margin-right: 0.5em;
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .shout-window {
    overflow: hidden auto;
    max-height: 20em;
  }

  .shout-window-container {
    height: 100%;
  }

  .shout-message {
    display: flex;
    padding: 0.2em 0.5em;
  }

  .shout-avatar {
    img {
      height: 24px;
      width: 24px;
      border-radius: var(--roundness);
      margin-right: 0.5em;
      margin-top: 0.25em;
    }
  }

  .shout-input {
    display: flex;

    textarea {
      flex: 1;
      margin: 0.6em;
      min-height: 3.5em;
      resize: none;
    }
  }

  .shout-panel {
    .title {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
