import { useListsStore } from 'src/stores/lists'
import Timeline from '../timeline/timeline.vue'
const ListsTimeline = {
  data () {
    return {
      listId: null
    }
  },
  components: {
    Timeline
  },
  computed: {
    timeline () { return this.$store.state.statuses.timelines.list }
  },
  watch: {
    $route: function (route) {
      if (route.name === 'lists-timeline' && route.params.id !== this.listId) {
        this.listId = route.params.id
        this.$store.dispatch('stopFetchingTimeline', 'list')
        this.$store.commit('clearTimeline', { timeline: 'list' })
        useListsStore().fetchList({ listId: this.listId })
        this.$store.dispatch('startFetchingTimeline', { timeline: 'list', listId: this.listId })
      }
    }
  },
  created () {
    this.listId = this.$route.params.id
    useListsStore().fetchList({ listId: this.listId })
    this.$store.dispatch('startFetchingTimeline', { timeline: 'list', listId: this.listId })
  },
  unmounted () {
    this.$store.dispatch('stopFetchingTimeline', 'list')
    this.$store.commit('clearTimeline', { timeline: 'list' })
  }
}

export default ListsTimeline
