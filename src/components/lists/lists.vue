<template>
  <div class="Lists panel panel-default">
    <div class="panel-heading">
      <TimelineMenu />
    </div>
    <div
      v-for="list in lists"
      :key="list.id"
    >
      {{ list.title }}
    </div>
    <div
      v-if="lists.length === 0"
      class="list-empty-content faint"
    >
      No lists
    </div>
  </div>
</template>

<script>
import TimelineMenu from '../timeline_menu/timeline_menu.vue'

export default {
  components: {
    TimelineMenu
  },
  data () {
    return {
      lists: [{ title: 'ASD', id: '1' }, { title: 'ASD2', id: '2' }]
    }
  }
}
</script>

<style lang="scss">
@import '../../_variables.scss';

.Lists {
  height: 10em;
}
</style>
