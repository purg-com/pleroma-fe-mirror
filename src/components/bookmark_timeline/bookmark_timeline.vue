<template>
  <Timeline
    :title="$t('nav.bookmarks')"
    :timeline="timeline"
    :timeline-name="'bookmarks'"
    :bookmark-folder-id="folderId"
  />
</template>

<script src="./bookmark_timeline.js"></script>
