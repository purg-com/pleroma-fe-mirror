<template>
  <div
    class="StatusContent"
    :class="{ '-compact': compact }"
  >
    <slot name="header" />
    <StatusBody
      :status="status"
      :compact="compact"
      :single-line="singleLine"
      :showing-tall="showingTall"
      :expanding-subject="expandingSubject"
      :showing-long-subject="showingLongSubject"
      :toggle-showing-tall="toggleShowingTall"
      :toggle-expanding-subject="toggleExpandingSubject"
      :toggle-showing-long-subject="toggleShowingLongSubject"
      @parse-ready="$emit('parseReady', $event)"
    >
      <div v-if="status.poll && status.poll.options && !compact">
        <Poll
          :base-poll="status.poll"
          :emoji="status.emojis"
        />
      </div>

      <div v-else-if="status.poll && status.poll.options && compact">
        <FAIcon
          icon="poll-h"
          size="2x"
        />
      </div>

      <gallery
        v-if="status.attachments.length !== 0"
        class="attachments media-body"
        :compact="compact"
        :nsfw="nsfwClickthrough"
        :attachments="status.attachments"
        :limit="compact ? 1 : 0"
        :size="attachmentSize"
        @play="$emit('mediaplay', attachment.id)"
        @pause="$emit('mediapause', attachment.id)"
      />

      <div
        v-if="statusCard && !noHeading && !compact"
        class="link-preview media-body"
      >
        <link-preview
          :card="status.card"
          :size="attachmentSize"
          :nsfw="nsfwClickthrough"
        />
      </div>
    </StatusBody>
    <slot name="footer" />
  </div>
</template>

<script src="./status_content.js"></script>
<style lang="scss">
.StatusContent {
  flex: 1;
  min-width: 0;
}
</style>
