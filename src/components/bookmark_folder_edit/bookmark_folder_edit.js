import apiService from '../../services/api/api.service'

const BookmarkFolderEdit = {
  data () {
    return {
      name: '',
      nameDraft: '',
      emoji: '',
      emojiUrl: null,
      emojiDraft: '',
      emojiUrlDraft: null,
      reallyDelete: false
    }
  },
  created () {
    if (!this.id) return
    const credentials = this.$store.state.users.currentUser.credentials
    apiService.fetchBookmarkFolders({ credentials })
      .then((folders) => {
        const folder = folders.find(folder => folder.id === this.id)
        if (!folder) return

        this.nameDraft = this.name = folder.name
        this.emojiDraft = this.emoji = folder.emoji
        this.emojiUrlDraft = this.emojiUrl = folder.emoji_url
      })
  },
  computed: {
    id () {
      return this.$route.params.id
    }
  },
  methods: {
    updateFolder () {
      this.$store.dispatch('setBookmarkFolder', { folderId: this.id, name: this.nameDraft, emoji: this.emojiDraft })
        .then((folder) => {
          this.nameDraft = this.name = folder.name
          this.emojiDraft = this.emoji = folder.emoji
          this.emojiUrlDraft = this.emojiUrl = folder.emoji_url
        })
    },
    createFolder () {
      this.$store.dispatch('createBookmarkFolder', { name: this.nameDraft, emoji: this.emojiDraft })
        .then((folder) => {
          return folder.id
        })
        .then((folderId) => {
          this.$router.push({ name: 'bookmark-folders' })
        })
        .catch((e) => {
          this.$store.dispatch('pushGlobalNotice', {
            messageKey: 'bookmark_folders.error',
            messageArgs: [e.message],
            level: 'error'
          })
        })
    },
    deleteFolder () {
      this.$store.dispatch('deleteBookmarkFolder', { folderId: this.id })
      this.$router.push({ name: 'bookmark-folders' })
    }
  }
}

export default BookmarkFolderEdit
