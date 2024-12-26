import BookmarkFolderCard from '../bookmark_folder_card/bookmark_folder_card.vue'

const BookmarkFolders = {
  data () {
    return {
      isNew: false
    }
  },
  components: {
    BookmarkFolderCard
  },
  computed: {
    bookmarkFolders () {
      return this.$store.state.bookmarkFolders.allFolders
    }
  },
  methods: {
    cancelNewFolder () {
      this.isNew = false
    },
    newFolder () {
      this.isNew = true
    }
  }
}

export default BookmarkFolders
