<template>
  <div
    v-if="!hideStatus"
    :style="hiddenStyle"
    class="Conversation"
    :class="{ '-expanded' : isExpanded, 'panel' : isExpanded }"
  >
    <div
      v-if="isExpanded"
      class="panel-heading conversation-heading -sticky"
    >
      <h1 class="title">
        {{ $t('timeline.conversation') }}
      </h1>
      <button
        v-if="collapsable"
        class="button-unstyled -link"
        @click.prevent="toggleExpanded"
      >
        {{ $t('timeline.collapse') }}
      </button>
      <QuickFilterSettings
        v-if="!collapsable && mobileLayout"
        :conversation="true"
        class="rightside-button"
      />
      <QuickViewSettings
        v-if="!collapsable"
        :conversation="true"
        class="rightside-button"
      />
    </div>
    <div
      v-if="isPage && !status"
      class="conversation-body"
      :class="{ 'panel-body': isExpanded }"
    >
      <p v-if="!loadStatusError">
        <FAIcon
          spin
          icon="circle-notch"
        />
        {{ $t('status.loading') }}
      </p>
      <p v-else>
        {{ $t('status.load_error', { error: loadStatusError }) }}
      </p>
    </div>
    <div
      v-else
      class="conversation-body"
      :class="{ 'panel-body': isExpanded }"
    >
      <div
        v-if="isTreeView"
        class="thread-body"
      >
        <div
          v-if="shouldShowAllConversationButton"
          class="conversation-dive-to-top-level-box"
        >
          <i18n-t
            keypath="status.show_all_conversation_with_icon"
            tag="button"
            class="button-unstyled -link"
            scope="global"
            @click.prevent="diveToTopLevel"
          >
            <template #icon>
              <FAIcon
                icon="angle-double-left"
              />
            </template>
            <template #text>
              <span>
                {{ $t('status.show_all_conversation', { numStatus: otherTopLevelCount }, otherTopLevelCount) }}
              </span>
            </template>
          </i18n-t>
        </div>
        <div
          v-if="shouldShowAncestors"
          class="thread-ancestors"
        >
          <article
            v-for="status in ancestorsOf(diveRoot)"
            :key="status.id"
            class="thread-ancestor"
            :class="{'thread-ancestor-has-other-replies': getReplies(status.id).length > 1, '-faded': shouldFadeAncestors}"
          >
            <status
              ref="statusComponent"
              :inline-expanded="collapsable && isExpanded"
              :statusoid="status"
              :expandable="!isExpanded"
              :show-pinned="pinnedStatusIdsObject && pinnedStatusIdsObject[status.id]"
              :focused="focused(status.id)"
              :in-conversation="isExpanded"
              :highlight="getHighlight()"
              :replies="getReplies(status.id)"
              :in-profile="inProfile"
              :profile-user-id="profileUserId"
              class="conversation-status status-fadein panel-body"

              :simple-tree="treeViewIsSimple"
              :toggle-thread-display="toggleThreadDisplay"
              :thread-display-status="threadDisplayStatus"
              :show-thread-recursively="showThreadRecursively"
              :total-reply-count="totalReplyCount"
              :total-reply-depth="totalReplyDepth"
              :show-other-replies-as-button="showOtherRepliesButtonInsideStatus"
              :dive="() => diveIntoStatus(status.id)"

              :controlled-showing-tall="statusContentProperties[status.id].showingTall"
              :controlled-expanding-subject="statusContentProperties[status.id].expandingSubject"
              :controlled-showing-long-subject="statusContentProperties[status.id].showingLongSubject"
              :controlled-replying="statusContentProperties[status.id].replying"
              :controlled-media-playing="statusContentProperties[status.id].mediaPlaying"
              :controlled-toggle-showing-tall="() => toggleStatusContentProperty(status.id, 'showingTall')"
              :controlled-toggle-expanding-subject="() => toggleStatusContentProperty(status.id, 'expandingSubject')"
              :controlled-toggle-showing-long-subject="() => toggleStatusContentProperty(status.id, 'showingLongSubject')"
              :controlled-toggle-replying="() => toggleStatusContentProperty(status.id, 'replying')"
              :controlled-set-media-playing="(newVal) => toggleStatusContentProperty(status.id, 'mediaPlaying', newVal)"

              @goto="setHighlight"
              @toggle-expanded="toggleExpanded"
            />
            <div
              v-if="showOtherRepliesButtonBelowStatus && getReplies(status.id).length > 1"
              class="thread-ancestor-dive-box"
            >
              <div
                class="thread-ancestor-dive-box-inner"
              >
                <i18n-t
                  tag="button"
                  scope="global"
                  keypath="status.ancestor_follow_with_icon"
                  class="button-unstyled -link thread-tree-show-replies-button"
                  @click.prevent="diveIntoStatus(status.id)"
                >
                  <template #icon>
                    <FAIcon
                      icon="angle-double-right"
                    />
                  </template>
                  <template #text>
                    <span>
                      {{ $t('status.ancestor_follow', { numReplies: getReplies(status.id, getReplies(status.id).length - 1).length - 1 }) }}
                    </span>
                  </template>
                </i18n-t>
              </div>
            </div>
          </article>
        </div>
        <thread-tree
          v-for="status in showingTopLevel"
          :key="status.id"
          ref="statusComponent"
          :depth="0"

          :status="status"
          :in-profile="inProfile"
          :conversation="conversation"
          :collapsable="collapsable"
          :is-expanded="isExpanded"
          :pinned-status-ids-object="pinnedStatusIdsObject"
          :profile-user-id="profileUserId"

          :focused="focused"
          :get-replies="getReplies"
          :highlight="maybeHighlight"
          :set-highlight="setHighlight"
          :toggle-expanded="toggleExpanded"

          :simple="treeViewIsSimple"
          :toggle-thread-display="toggleThreadDisplay"
          :thread-display-status="threadDisplayStatus"
          :show-thread-recursively="showThreadRecursively"
          :total-reply-count="totalReplyCount"
          :total-reply-depth="totalReplyDepth"
          :status-content-properties="statusContentProperties"
          :set-status-content-property="setStatusContentProperty"
          :toggle-status-content-property="toggleStatusContentProperty"
          :dive="canDive ? diveIntoStatus : undefined"
        />
      </div>
      <div
        v-if="isLinearView"
        class="thread-body"
      >
        <article>
          <status
            v-for="status in conversation"
            :key="status.id"
            ref="statusComponent"
            :inline-expanded="collapsable && isExpanded"
            :statusoid="status"
            :expandable="!isExpanded"
            :show-pinned="pinnedStatusIdsObject && pinnedStatusIdsObject[status.id]"
            :focused="focused(status.id)"
            :in-conversation="isExpanded"
            :highlight="getHighlight()"
            :replies="getReplies(status.id)"
            :in-profile="inProfile"
            :profile-user-id="profileUserId"
            class="conversation-status status-fadein panel-body"

            :toggle-thread-display="toggleThreadDisplay"
            :thread-display-status="threadDisplayStatus"
            :show-thread-recursively="showThreadRecursively"
            :total-reply-count="totalReplyCount"
            :total-reply-depth="totalReplyDepth"
            :status-content-properties="statusContentProperties"
            :set-status-content-property="setStatusContentProperty"
            :toggle-status-content-property="toggleStatusContentProperty"

            @goto="setHighlight"
            @toggle-expanded="toggleExpanded"
          />
        </article>
      </div>
    </div>
  </div>
  <div
    v-else
    class="Conversation -hidden"
    :style="hiddenStyle"
  />
</template>

<script src="./conversation.js"></script>

<style lang="scss">
.Conversation {
  z-index: 1;

  &.-hidden {
    background: var(--__panel-background);
    backdrop-filter: var(--__panel-backdrop-filter);
  }

  .conversation-dive-to-top-level-box {
    padding: var(--status-margin);
    border-bottom: 1px solid var(--border);
    border-radius: 0;

    /* Make the button stretch along the whole row */
    display: flex;
    align-items: stretch;
    flex-direction: column;
  }

  .thread-ancestors {
    margin-left: var(--status-margin);
    border-left: 2px solid var(--border);
  }

  .thread-ancestor.-faded .RichContent {
    /* stylelint-disable declaration-no-important */
    --text: var(--textFaint) !important;
    --link: var(--linkFaint) !important;
    --funtextGreentext: var(--funtextGreentextFaint) !important;
    --funtextCyantext: var(--funtextCyantextFaint) !important;
    /* stylelint-enable declaration-no-important */
  }

  .thread-ancestor-dive-box {
    padding-left: var(--status-margin);
    border-bottom: 1px solid var(--border);
    border-radius: 0;

    /* Make the button stretch along the whole row */
    &,
    &-inner {
      display: flex;
      align-items: stretch;
      flex-direction: column;
    }
  }

  .thread-ancestor-dive-box-inner {
    padding: var(--status-margin);
  }

  .conversation-status {
    border-bottom: 1px solid var(--border);
    border-radius: 0;
  }

  .thread-ancestor-has-other-replies .conversation-status,
  &:last-child:not(.-expanded) .conversation-status,
  &.-expanded .conversation-status:last-child,
  .thread-ancestor:last-child .conversation-status,
  .thread-ancestor:last-child .thread-ancestor-dive-box,
  &.-expanded .thread-tree .conversation-status {
    border-bottom: none;
  }

  .thread-ancestors + .thread-tree > .conversation-status {
    border-top: 1px solid var(--border);
  }

  /* expanded conversation in timeline */
  &.status-fadein.-expanded .thread-body {
    border-left: 4px solid var(--cRed);
    border-radius: var(--roundness);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom: 1px solid var(--border);
  }

  &.-expanded.status-fadein {
    --___margin: calc(var(--status-margin) / 2);

    background: var(--background);
    margin: var(--___margin);

    &::before {
      z-index: -1;
      content: "";
      display: block;
      position: absolute;
      inset: calc(var(--___margin) * -1);
      background: var(--background);
      backdrop-filter: var(--__panel-backdrop-filter);
    }
  }
}
</style>
