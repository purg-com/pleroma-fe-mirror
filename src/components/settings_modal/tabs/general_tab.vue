<template>
  <div :label="$t('settings.general')">
    <div class="setting-item">
      <h2>{{ $t('settings.interface') }}</h2>
      <ul class="setting-list">
        <li>
          <interface-language-switcher
            :prompt-text="$t('settings.interfaceLanguage')"
            :language="language"
            :set-language="val => language = val"
          />
        </li>
        <li v-if="instanceSpecificPanelPresent">
          <BooleanSetting path="hideISP">
            {{ $t('settings.hide_isp') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="stopGifs">
            {{ $t('settings.stop_gifs') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="streaming">
            {{ $t('settings.streaming') }}
          </BooleanSetting>
          <ul class="setting-list suboptions">
            <li>
              <BooleanSetting
                path="pauseOnUnfocused"
                parent-path="streaming"
              >
                {{ $t('settings.pause_on_unfocused') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting
            path="useStreamingApi"
            expert="1"
          >
            {{ $t('settings.useStreamingApi') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="virtualScrolling"
            expert="1"
          >
            {{ $t('settings.virtual_scrolling') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            id="userPopoverAvatarAction"
            path="userPopoverAvatarAction"
            :options="userPopoverAvatarActionOptions"
            expert="1"
          >
            {{ $t('settings.user_popover_avatar_action') }}
          </ChoiceSetting>
        </li>
        <li>
          <BooleanSetting
            path="userPopoverOverlay"
            expert="1"
          >
            {{ $t('settings.user_popover_avatar_overlay') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="alwaysShowNewPostButton"
            expert="1"
          >
            {{ $t('settings.always_show_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="autohideFloatingPostButton"
            expert="1"
          >
            {{ $t('settings.autohide_floating_post_button') }}
          </BooleanSetting>
        </li>
        <li v-if="instanceShoutboxPresent">
          <BooleanSetting
            path="hideShoutbox"
            expert="1"
          >
            {{ $t('settings.hide_shoutbox') }}
          </BooleanSetting>
        </li>
        <li class="select-multiple">
          <span class="label">{{ $t('settings.confirm_dialogs') }}</span>
          <ul class="option-list">
            <li>
              <BooleanSetting path="modalOnRepeat">
                {{ $t('settings.confirm_dialogs_repeat') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnUnfollow">
                {{ $t('settings.confirm_dialogs_unfollow') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnBlock">
                {{ $t('settings.confirm_dialogs_block') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnMute">
                {{ $t('settings.confirm_dialogs_mute') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnMuteConversation">
                {{ $t('settings.confirm_dialogs_mute_conversation') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnMuteDomain">
                {{ $t('settings.confirm_dialogs_mute_domain') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnDelete">
                {{ $t('settings.confirm_dialogs_delete') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnLogout">
                {{ $t('settings.confirm_dialogs_logout') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnApproveFollow">
                {{ $t('settings.confirm_dialogs_approve_follow') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnDenyFollow">
                {{ $t('settings.confirm_dialogs_deny_follow') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnRemoveUserFromFollowers">
                {{ $t('settings.confirm_dialogs_remove_follower') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.post_look_feel') }}</h2>
      <ul class="setting-list">
        <li>
          <ChoiceSetting
            id="conversationDisplay"
            path="conversationDisplay"
            :options="conversationDisplayOptions"
          >
            {{ $t('settings.conversation_display') }}
          </ChoiceSetting>
        </li>
        <ul
          v-if="mergedConfig.conversationDisplay !== 'linear'"
          class="setting-list suboptions"
        >
          <li>
            <BooleanSetting path="conversationTreeAdvanced">
              {{ $t('settings.tree_advanced') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting
              path="conversationTreeFadeAncestors"
              :expert="1"
            >
              {{ $t('settings.tree_fade_ancestors') }}
            </BooleanSetting>
          </li>
          <li>
            <IntegerSetting
              path="maxDepthInThread"
              :min="3"
              :expert="1"
            >
              {{ $t('settings.max_depth_in_thread') }}
            </IntegerSetting>
          </li>
          <li>
            <ChoiceSetting
              id="conversationOtherRepliesButton"
              path="conversationOtherRepliesButton"
              :options="conversationOtherRepliesButtonOptions"
              :expert="1"
            >
              {{ $t('settings.conversation_other_replies_button') }}
            </ChoiceSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting path="collapseMessageWithSubject">
            {{ $t('settings.collapse_subject') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="emojiReactionsOnTimeline"
            expert="1"
          >
            {{ $t('settings.emoji_reactions_on_timeline') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            v-if="user"
            source="profile"
            path="stripRichContent"
            expert="1"
          >
            {{ $t('settings.no_rich_text_description') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="useAbsoluteTimeFormat"
            expert="1"
          >
            {{ $t('settings.absolute_time_format') }}
          </BooleanSetting>
        </li>
        <ul
          v-if="mergedConfig.useAbsoluteTimeFormat"
          class="setting-list suboptions"
        >
          <li>
            <UnitSetting
              path="absoluteTimeFormatMinAge"
              unit-set="time"
              :units="['s', 'm', 'h', 'd']"
              :min="0"
            >
              {{ $t('settings.absolute_time_format_min_age') }}
            </UnitSetting>
          </li>
          <li>
            <ChoiceSetting
              id="absoluteTime12h"
              path="absoluteTime12h"
              :options="absoluteTime12hOptions"
              :expert="1"
            >
              {{ $t('settings.absolute_time_format_12h') }}
            </ChoiceSetting>
          </li>
        </ul>
        <h3>{{ $t('settings.attachments') }}</h3>
        <li>
          <BooleanSetting
            path="imageCompression"
            expert="1"
          >
            {{ $t('settings.image_compression') }}
          </BooleanSetting>
        </li>
        <ul class="setting-list suboptions">
          <li>
            <BooleanSetting
              path="alwaysUseJpeg"
              expert="1"
              parent-path="imageCompression"
            >
              {{ $t('settings.always_use_jpeg') }}
            </BooleanSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting
            path="useContainFit"
            expert="1"
          >
            {{ $t('settings.use_contain_fit') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hideNsfw">
            {{ $t('settings.nsfw_clickthrough') }}
          </BooleanSetting>
        </li>
        <ul class="setting-list suboptions">
          <li>
            <BooleanSetting
              path="preloadImage"
              expert="1"
              parent-path="hideNsfw"
            >
              {{ $t('settings.preload_images') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting
              path="useOneClickNsfw"
              expert="1"
              parent-path="hideNsfw"
            >
              {{ $t('settings.use_one_click_nsfw') }}
            </BooleanSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting
            path="loopVideo"
            expert="1"
          >
            {{ $t('settings.loop_video') }}
          </BooleanSetting>
          <ul class="setting-list suboptions">
            <li>
              <BooleanSetting
                path="loopVideoSilentOnly"
                expert="1"
                parent-path="loopVideo"
                :disabled="!loopSilentAvailable"
              >
                {{ $t('settings.loop_video_silent_only') }}
              </BooleanSetting>
              <div
                v-if="!loopSilentAvailable"
                class="unavailable"
              >
                <FAIcon icon="globe" />! {{ $t('settings.limited_availability') }}
              </div>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting
            path="playVideosInModal"
            expert="1"
          >
            {{ $t('settings.play_videos_in_modal') }}
          </BooleanSetting>
        </li>
        <h3>{{ $t('settings.mention_links') }}</h3>
        <li>
          <ChoiceSetting
            id="mentionLinkDisplay"
            path="mentionLinkDisplay"
            :options="mentionLinkDisplayOptions"
          >
            {{ $t('settings.mention_link_display') }}
          </ChoiceSetting>
        </li>
        <li>
          <BooleanSetting
            path="mentionLinkShowTooltip"
            expert="1"
          >
            {{ $t('settings.mention_link_use_tooltip') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="mentionLinkShowAvatar">
            {{ $t('settings.mention_link_show_avatar') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="mentionLinkFadeDomain"
            expert="1"
          >
            {{ $t('settings.mention_link_fade_domain') }}
          </BooleanSetting>
        </li>
        <li v-if="user">
          <BooleanSetting
            path="mentionLinkBoldenYou"
            expert="1"
          >
            {{ $t('settings.mention_link_bolden_you') }}
          </BooleanSetting>
        </li>
        <h3 v-if="expertLevel > 0">
          {{ $t('settings.fun') }}
        </h3>
        <li>
          <BooleanSetting
            path="greentext"
            expert="1"
          >
            {{ $t('settings.greentext') }}
          </BooleanSetting>
        </li>
        <li v-if="user">
          <BooleanSetting
            path="mentionLinkShowYous"
            expert="1"
          >
            {{ $t('settings.show_yous') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>

    <div
      v-if="user"
      class="setting-item"
    >
      <h2>{{ $t('settings.composing') }}</h2>
      <ul class="setting-list">
        <li>
          <label for="default-vis">
            {{ $t('settings.default_vis') }} <ProfileSettingIndicator :is-profile="true" />
            <ScopeSelector
              class="scope-selector"
              :show-all="true"
              :user-default="$store.state.profileConfig.defaultScope"
              :initial-scope="$store.state.profileConfig.defaultScope"
              :on-scope-change="changeDefaultScope"
            />
          </label>
        </li>
        <li>
          <!-- <BooleanSetting source="profile" path="defaultNSFW"> -->
          <BooleanSetting path="sensitiveByDefault">
            {{ $t('settings.sensitive_by_default') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="scopeCopy"
            expert="1"
          >
            {{ $t('settings.scope_copy') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="alwaysShowSubjectInput"
            expert="1"
          >
            {{ $t('settings.subject_input_always_show') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            id="subjectLineBehavior"
            path="subjectLineBehavior"
            :options="subjectLineOptions"
            expert="1"
          >
            {{ $t('settings.subject_line_behavior') }}
          </ChoiceSetting>
        </li>
        <li v-if="postFormats.length > 0">
          <ChoiceSetting
            id="postContentType"
            path="postContentType"
            :options="postContentOptions"
          >
            {{ $t('settings.post_status_content_type') }}
          </ChoiceSetting>
        </li>
        <li>
          <BooleanSetting
            path="minimalScopesMode"
            expert="1"
          >
            {{ $t('settings.minimal_scopes_mode') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="padEmoji"
            expert="1"
          >
            {{ $t('settings.pad_emoji') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="autocompleteSelect"
            expert="1"
          >
            {{ $t('settings.autocomplete_select_first') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="autoSaveDraft"
          >
            {{ $t('settings.auto_save_draft') }}
          </BooleanSetting>
        </li>
        <li v-if="!mergedConfig.autoSaveDraft">
          <ChoiceSetting
            id="unsavedPostAction"
            path="unsavedPostAction"
            :options="unsavedPostActionOptions"
          >
            {{ $t('settings.unsaved_post_action') }}
          </ChoiceSetting>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./general_tab.js"></script>
