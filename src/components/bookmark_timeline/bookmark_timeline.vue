<template>
  <Timeline
    :title="$t('nav.bookmarks')"
    :timeline="timeline"
    :timeline-name="'bookmarks'"
    :bookmark-folder-id="bookmarkFolderId"
  />
</template>

<script src="./bookmark_timeline.js"></script>
