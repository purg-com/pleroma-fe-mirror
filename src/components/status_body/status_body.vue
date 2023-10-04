<template>
  <div
    class="StatusBody"
    :class="{ '-compact': compact }"
  >
    <div class="body">
      <div
        v-if="languages"
        class="language-selector"
      >
        <button
          v-for="language in languages"
          :key="language"
          class="language-selector-item tab button-default"
          :class="{ active: language === currentLanguageOrDefault }"
          @click="setCurrentLanguage(language)"
        >
          {{ language }}
        </button>
      </div>
      <div
        v-if="summary"
        class="summary-wrapper"
        :class="{ '-tall': (longSubject && !showingLongSubject) }"
      >
        <RichContent
          class="media-body summary"
          :html="summary"
          :emoji="status.emojis"
        />
        <button
          v-show="longSubject && showingLongSubject"
          class="button-unstyled -link tall-subject-hider"
          @click.prevent="toggleShowingLongSubject"
        >
          {{ $t("status.hide_full_subject") }}
        </button>
        <button
          v-show="longSubject && !showingLongSubject"
          class="button-unstyled -link tall-subject-hider"
          @click.prevent="toggleShowingLongSubject"
        >
          {{ $t("status.show_full_subject") }}
        </button>
      </div>
      <div
        :class="{'-tall-status': hideTallStatus}"
        class="text-wrapper"
      >
        <button
          v-show="hideTallStatus"
          class="button-unstyled -link tall-status-hider"
          :class="{ '-focused': focused }"
          @click.prevent="toggleShowMore"
        >
          {{ $t("general.show_more") }}
        </button>
        <RichContent
          v-if="!hideSubjectStatus && !(singleLine && summary)"
          :class="{ '-single-line': singleLine }"
          class="text media-body"
          :html="content"
          :emoji="status.emojis"
          :handle-links="true"
          :greentext="mergedConfig.greentext"
          :attentions="status.attentions"
          @parseReady="onParseReady"
        />

        <button
          v-show="hideSubjectStatus"
          class="button-unstyled -link cw-status-hider"
          @click.prevent="toggleShowMore"
        >
          {{ $t("status.show_content") }}
          <FAIcon
            v-if="attachmentTypes.includes('image')"
            icon="image"
          />
          <FAIcon
            v-if="attachmentTypes.includes('video')"
            icon="video"
          />
          <FAIcon
            v-if="attachmentTypes.includes('audio')"
            icon="music"
          />
          <FAIcon
            v-if="attachmentTypes.includes('unknown')"
            icon="file"
          />
          <FAIcon
            v-if="status.poll && status.poll.options"
            icon="poll-h"
          />
          <FAIcon
            v-if="status.card"
            icon="link"
          />
        </button>
        <button
          v-show="showingMore && !fullContent"
          class="button-unstyled -link status-unhider"
          @click.prevent="toggleShowMore"
        >
          {{ tallStatus ? $t("general.show_less") : $t("status.hide_content") }}
        </button>
      </div>
    </div>
    <slot v-if="!hideSubjectStatus" />
  </div>
</template>
<script src="./status_body.js"></script>
<style lang="scss" src="./status_body.scss" />
