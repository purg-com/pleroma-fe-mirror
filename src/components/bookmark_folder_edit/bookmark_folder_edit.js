import EmojiPicker from '../emoji_picker/emoji_picker.vue'
import apiService from '../../services/api/api.service'
import { useInterfaceStore } from 'src/stores/interface'
import { useBookmarkFoldersStore } from 'src/stores/bookmark_folders'

const BookmarkFolderEdit = {
  data () {
    return {
      name: '',
      nameDraft: '',
      emoji: '',
      emojiUrl: null,
      emojiDraft: '',
      emojiUrlDraft: null,
      emojiPickerExpanded: false,
      reallyDelete: false
    }
  },
  components: {
    EmojiPicker
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
    selectEmoji (event) {
      this.emojiDraft = event.insertion
      this.emojiUrlDraft = event.insertionUrl
    },
    showEmojiPicker () {
      if (!this.emojiPickerExpanded) {
        this.$refs.picker.showPicker()
      }
    },
    onShowPicker () {
      this.emojiPickerExpanded = true
    },
    onClosePicker () {
      this.emojiPickerExpanded = false
    },
    updateFolder () {
      useBookmarkFoldersStore().updateBookmarkFolder({ folderId: this.id, name: this.nameDraft, emoji: this.emojiDraft })
        .then(() => {
          this.$router.push({ name: 'bookmark-folders' })
        })
    },
    createFolder () {
      useBookmarkFoldersStore().createBookmarkFolder({ name: this.nameDraft, emoji: this.emojiDraft })
        .then(() => {
          this.$router.push({ name: 'bookmark-folders' })
        })
        .catch((e) => {
          useInterfaceStore().pushGlobalNotice({
            messageKey: 'bookmark_folders.error',
            messageArgs: [e.message],
            level: 'error'
          })
        })
    },
    deleteFolder () {
      useBookmarkFoldersStore().deleteBookmarkFolder({ folderId: this.id })
      this.$router.push({ name: 'bookmark-folders' })
    }
  }
}

export default BookmarkFolderEdit
