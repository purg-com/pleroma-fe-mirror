<template>
  <div>
    <div
      v-if="user"
      class="user-profile panel panel-default"
    >
      <div class="panel-body">
        <UserCard
          :user-id="userId"
          :switcher="true"
          :selected="timeline.viewing"
          avatar-action="zoom"
          rounded="top"
          :has-note-editor="true"
        />
        <span
          v-if="!!user.birthday"
          class="user-birthday"
        >
          <FAIcon
            class="fa-old-padding"
            icon="birthday-cake"
          />
          {{ $t('user_card.birthday', { birthday: formattedBirthday }) }}
        </span>
        <div
          v-if="user.fields_html && user.fields_html.length > 0"
          class="user-profile-fields"
        >
          <dl
            v-for="(field, index) in user.fields_html"
            :key="index"
            class="user-profile-field"
          >
            <dt
              :title="user.fields_text[index].name"
              class="user-profile-field-name"
            >
              <RichContent
                :html="field.name"
                :emoji="user.emoji"
              />
            </dt>
            <dd
              :title="user.fields_text[index].value"
              class="user-profile-field-value"
            >
              <RichContent
                :html="field.value"
                :emoji="user.emoji"
              />
            </dd>
          </dl>
        </div>
      </div>
      <tab-switcher
        :active-tab="tab"
        :render-only-focused="true"
        :on-switch="onTabSwitch"
      >
        <Timeline
          key="statuses"
          :label="$t('user_card.statuses')"
          :count="user.statuses_count"
          :embedded="true"
          :title="$t('user_profile.timeline_title')"
          :timeline="timeline"
          timeline-name="user"
          :user-id="userId"
          :pinned-status-ids="user.pinnedStatusIds"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
        <div
          v-if="followsTabVisible"
          key="followees"
          class="panel-body"
          :label="$t('user_card.followees')"
          :disabled="!user.friends_count"
        >
          <FriendList
            :user-id="userId"
            :non-interactive="true"
          >
            <template #item="{item}">
              <FollowCard :user="item" />
            </template>
          </FriendList>
        </div>
        <div
          v-if="followersTabVisible"
          key="followers"
          class="panel-body"
          :label="$t('user_card.followers')"
          :disabled="!user.followers_count"
        >
          <FollowerList
            :user-id="userId"
            :non-interactive="true"
          >
            <template #item="{item}">
              <FollowCard
                :user="item"
                :no-follows-you="isUs"
              />
            </template>
          </FollowerList>
        </div>
        <Timeline
          key="media"
          :label="$t('user_card.media')"
          :disabled="!media.visibleStatuses.length"
          :embedded="true"
          :title="$t('user_card.media')"
          timeline-name="media"
          :timeline="media"
          :user-id="userId"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
        <Timeline
          v-if="favoritesTabVisible"
          key="favorites"
          :label="$t('user_card.favorites')"
          :disabled="!favorites.visibleStatuses.length"
          :embedded="true"
          :title="$t('user_card.favorites')"
          timeline-name="favorites"
          :timeline="favorites"
          :user-id="isUs ? undefined : userId"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
      </tab-switcher>
      <div
        :ref="setFooterRef"
        class="panel-footer"
      />
    </div>
    <div
      v-else
      class="panel user-profile-placeholder"
    >
      <div class="panel-heading">
        <h1 class="title">
          {{ $t('settings.profile_tab') }}
        </h1>
      </div>
      <div>
        <span v-if="error">{{ error }}</span>
        <FAIcon
          v-else
          spin
          icon="circle-notch"
        />
      </div>
    </div>
  </div>
</template>

<script src="./user_profile.js"></script>

<style lang="scss">
.user-profile {
  flex: 2;
  flex-basis: 500px;

  // No sticky header on user profile
  --currentPanelStack: 0;

  .user-birthday {
    margin: 0 0.75em 0.5em;
  }

  .user-profile-fields {
    margin: 0 0.5em;

    img {
      object-fit: contain;
      vertical-align: middle;
      max-width: 100%;
      max-height: 400px;

      &.emoji {
        width: 18px;
        height: 18px;
      }
    }

    .user-profile-field {
      display: flex;
      margin: 0.25em;
      border: 1px solid var(--border);
      border-radius: var(--roundness);

      .user-profile-field-name {
        flex: 0 1 30%;
        font-weight: 500;
        text-align: right;
        color: var(--lightText);
        min-width: 120px;
        border-right: 1px solid var(--border);
      }

      .user-profile-field-value {
        flex: 1 1 70%;
        color: var(--text);
        margin: 0 0 0 0.25em;
      }

      .user-profile-field-name,
      .user-profile-field-value {
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding: 0.5em 1.5em;
        box-sizing: border-box;
      }
    }
  }

  .userlist-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2em;
  }
}

.user-profile-placeholder {
  .panel-body {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 7em;
  }
}

</style>
