import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronRight, faFolder } from '@fortawesome/free-solid-svg-icons'
import { mapState } from 'vuex'

import Popover from '../popover/popover.vue'

library.add(faChevronRight, faFolder)

const StatusBookmarkFolderMenu = {
  props: [
    'status'
  ],
  data () {
    return {}
  },
  components: {
    Popover
  },
  computed: {
    ...mapState({
      folders: state => state.bookmarkFolders.allFolders
    }),
    folderId () {
      return this.status.bookmark_folder_id
    }
  },
  methods: {
    toggleFolder (id) {
      const value = id === this.folderId ? null : id

      this.$store.dispatch('bookmark', { id: this.status.id, bookmark_folder_id: value })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    }
  }
}

export default StatusBookmarkFolderMenu
