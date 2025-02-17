<template>
  <div class="Drafts">
    <div class="panel panel-default">
      <div class="panel-heading -sticky">
        <div class="title">
          {{ $t('drafts.drafts') }}
        </div>
      </div>
      <div class="panel-body">
        <div
          v-if="drafts.length === 0"
          class="empty-drafs-list-alert"
        >
          {{ $t('drafts.no_drafts') }}
        </div>
        <List
          v-else
          :items="drafts"
          :non-interactive="true"
        >
          <template #item="{ item: draft }">
            <Draft
              class="draft"
              :draft="draft"
            />
          </template>
        </List>
      </div>
    </div>
  </div>
</template>

<script src="./drafts.js"></script>

<style lang="scss">
.draft {
  margin: 1em 0;
}

.empty-drafs-list-alert {
  padding: 3em;
  font-size: 1.2em;
  display: flex;
  justify-content: center;
  color: var(--textFaint);
}

</style>
