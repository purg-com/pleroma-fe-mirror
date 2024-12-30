<template>
  <div class="Drafts">
    <div class="panel panel-default">
      <div class="panel-heading">
        <div class="title">
          {{ $t('drafts.drafts') }}
        </div>
      </div>
      <div class="panel-body">
        <p v-if="drafts.length === 0">
          {{ $t('drafts.no_drafts') }}
        </p>
        <List
          v-else
          :items="drafts"
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
</style>
