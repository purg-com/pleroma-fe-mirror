import { mapState } from 'vuex'
import NavigationEntry from 'src/components/navigation/navigation_entry.vue'
import { getBookmarkFolderEntries } from 'src/components/navigation/filter.js'

export const BookmarkFoldersMenuContent = {
  props: [
    'showPin'
  ],
  components: {
    NavigationEntry
  },
  computed: {
    ...mapState({
      folders: getBookmarkFolderEntries
    })
  }
}

export default BookmarkFoldersMenuContent
