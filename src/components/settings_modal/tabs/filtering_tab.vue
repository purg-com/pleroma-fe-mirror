<template>
  <div :label="$t('settings.filtering')">
    <div class="setting-item">
      <h2>{{ $t('settings.posts') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="hideFilteredStatuses">
            {{ $t('settings.hide_filtered_statuses') }}
          </BooleanSetting>
          <ul class="setting-list suboptions">
            <li>
              <BooleanSetting
                parent-path="hideFilteredStatuses"
                :parent-invert="true"
                path="hideWordFilteredPosts"
              >
                {{ $t('settings.hide_wordfiltered_statuses') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting
                v-if="user"
                parent-path="hideFilteredStatuses"
                :parent-invert="true"
                path="hideMutedThreads"
              >
                {{ $t('settings.hide_muted_threads') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting
                v-if="user"
                parent-path="hideFilteredStatuses"
                :parent-invert="true"
                path="hideMutedPosts"
              >
                {{ $t('settings.hide_muted_posts') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path="muteBotStatuses">
            {{ $t('settings.mute_bot_posts') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="muteSensitiveStatuses">
            {{ $t('settings.mute_sensitive_posts') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hidePostStats">
            {{ $t('settings.hide_post_stats') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hideBotIndication">
            {{ $t('settings.hide_actor_type_indication') }}
          </BooleanSetting>
        </li>
        <ChoiceSetting
          v-if="user"
          id="replyVisibility"
          path="replyVisibility"
          :options="replyVisibilityOptions"
        >
          {{ $t('settings.replies_in_timeline') }}
        </ChoiceSetting>
        <li>
          <h3>{{ $t('settings.wordfilter') }}</h3>
          <textarea
            id="muteWords"
            v-model="muteWordsString"
            class="input resize-height"
          />
          <div>{{ $t('settings.filtering_explanation') }}</div>
        </li>
        <h3>{{ $t('settings.attachments') }}</h3>
        <li>
          <IntegerSetting
            path="maxThumbnails"
            expert="1"
            :min="0"
          >
            {{ $t('settings.max_thumbnails') }}
          </IntegerSetting>
        </li>
        <li>
          <BooleanSetting path="hideAttachments">
            {{ $t('settings.hide_attachments_in_tl') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hideAttachmentsInConv">
            {{ $t('settings.hide_attachments_in_convo') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hideScrobbles">
            {{ $t('settings.hide_scrobbles') }}
          </BooleanSetting>
        </li>
        <li>
          <UnitSetting
            key="hideScrobblesAfter"
            path="hideScrobblesAfter"
            :units="['m', 'h', 'd']"
            unit-set="time"
            expert="1"
          >
            {{ $t('settings.hide_scrobbles_after') }}
          </UnitSetting>
        </li>
      </ul>
    </div>
    <div
      v-if="expertLevel > 0"
      class="setting-item"
    >
      <h2>{{ $t('settings.user_profiles') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="hideUserStats">
            {{ $t('settings.hide_user_stats') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
  </div>
</template>
<script src="./filtering_tab.js"></script>
