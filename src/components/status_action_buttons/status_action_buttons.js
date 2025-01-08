import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faRetweet,
  faPlus,
  faMinus,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faRetweet,
  faPlus,
  faMinus,
  faCheck
)
const PRIVATE_SCOPES = new Set(['private', 'direct'])
const PUBLIC_SCOPES = new Set(['public', 'unlisted'])
const BUTTONS = [{
  // =========
  // REPLY
  // =========
  name: 'reply',
  label: 'tool_tip.reply',
  icon: 'reply',
  active: ({ replying }) => replying,
  counter: ({ status }) => status.replies_count,
  anon: true,
  anonLink: true,
  toggleable: true,
  action ({ emit }) {
    emit('toggle')
  }
}, {
  // =========
  // REPEAT
  // =========
  name: 'retweet',
  label: 'tool_tip.repeat',
  icon ({ status }) {
    if (PRIVATE_SCOPES.has(status.visibility)) {
      return 'lock'
    }
    return 'retweet'
  },
  animated: true,
  active: ({ status }) => status.repeated,
  counter: ({ status }) => status.replies_count,
  anonLink: true,
  interactive: ({ status }) => !PRIVATE_SCOPES.has(status.visibility),
  toggleable: true,
  confirm: ({ status, getters }) => !status.repeated && getters.mergedConfig.modalOnRepeat,
  action ({ status, store }) {
    if (!status.repeated) {
      return store.dispatch('retweet', { id: status.id })
    } else {
      return store.dispatch('unretweet', { id: status.id })
    }
  }
}, {
  // =========
  // FAVORITE
  // =========
  name: 'favorite',
  label: 'tool_tip.favorite',
  icon: 'star',
  animated: true,
  active: ({ status }) => status.favorited,
  counter: ({ status }) => status.fave_count,
  anonLink: true,
  toggleable: true,
  action ({ status, store }) {
    if (!status.favorited) {
      return store.dispatch('favorite', { id: status.id })
    } else {
      return store.dispatch('unfavorite', { id: status.id })
    }
  }
}, {
  // =========
  // EMOJI REACTIONS
  // =========
  name: 'emoji',
  label: 'tool_lip.add_reaction',
  icon: 'smile-beam',
  anonLink: true,
  action ({ emojiPicker }) {
    emojiPicker.show()
  }
}, {
  // =========
  // MUTE CONVERSATION, my beloved
  // =========
  name: 'mute-conversation',
  icon: 'eye-slash',
  label: ({ status }) => status.thread_muted
    ? 'status.unmute_conversation'
    : 'status.mute_conversation',
  if: ({ loggedIn }) => loggedIn,
  toggleable: true,
  action ({ status, dispatch, emit }) {
    if (status.thread_muted) {
      return dispatch('unmuteConversation', { id: status.id })
    } else {
      return dispatch('muteConversation', { id: status.id })
    }
  }
}, {
  // =========
  // PIN STATUS
  // =========
  name: 'pin',
  icon: 'thumbtack',
  label: ({ status }) => status.pinned
    ? 'status.pin'
    : 'status.unpin',
  if ({ status, loggedIn, currentUser }) {
    return loggedIn &&
      status.user.id === currentUser.id &&
      PUBLIC_SCOPES.has(status.visibility)
  },
  action ({ status, dispatch, emit }) {
    if (status.pinned) {
      return dispatch('unpinStatus', { id: status.id })
    } else {
      return dispatch('pinStatus', { id: status.id })
    }
  }
}, {
  // =========
  // BOOKMARK
  // =========
  name: 'bookmark',
  icon: 'bookmark',
  label: ({ status }) => status.bookmarked
    ? 'status.bookmark'
    : 'status.unbookmark',
  if: ({ loggedIn }) => loggedIn,
  action ({ status, dispatch, emit }) {
    if (status.bookmarked) {
      return dispatch('unbookmark', { id: status.id })
    } else {
      return dispatch('bookmark', { id: status.id })
    }
  }
}, {
  // =========
  // EDIT
  // =========
  name: 'edit',
  icon: 'pen',
  label: 'status.edit',
  if ({ status, loggedIn, currentUser, state }) {
    return loggedIn &&
      state.instance.editingAvailable &&
      status.user.id === currentUser.id
  },
  action ({ dispatch, status }) {
    return dispatch('fetchStatusSource', { id: status.id })
      .then(data => dispatch('openEditStatusModal', {
        statusId: status.id,
        subject: data.spoiler_text,
        statusText: data.text,
        statusIsSensitive: status.nsfw,
        statusPoll: status.poll,
        statusFiles: [...status.attachments],
        visibility: status.visibility,
        statusContentType: data.content_type
      }))
  }
}, {
  // =========
  // DELETE
  // =========
  name: 'delete',
  icon: 'times',
  label: 'status.delete',
  if ({ status, loggedIn, currentUser }) {
    return loggedIn && (
      status.user.id === currentUser.id ||
        currentUser.privileges.includes('messages_delete')
    )
  },
  action ({ dispatch, status }) {
    dispatch('deleteStatus', { id: status.id })
  }
}, {
  // =========
  // SHARE/COPY
  // =========
  name: 'share',
  icon: 'share-alt',
  label: 'status.copy_link',
  action ({ state, status, router }) {
    navigator.clipboard.writeText([
      state.instance.server,
      router.resolve({ name: 'conversation', params: { id: status.id } }).href
    ].join(''))
  }
}, {
  // =========
  // EXTERNAL
  // =========
  name: 'external',
  icon: 'external-link-alt',
  label: 'status.external_source',
  link: ({ status }) => status.external_url
}, {
  // =========
  // REPORT
  // =========
  name: 'report',
  icon: 'flag',
  label: 'status.report',
  if: ({ loggedIn }) => loggedIn,
  action ({ dispatch, status }) {
    dispatch('openUserReportingModal', { userId: status.user.id, statusIds: [status.id] })
  }
}]

const StatusActionButtons = {
  props: ['status'],
  components: {
    ConfirmModal
  },
  data () {
    return {
    }
  },
  methods: {
    retweet () {
      if (!this.status.repeated && this.shouldConfirmRepeat) {
        this.showConfirmDialog()
      } else {
        this.doRetweet()
      }
    },
    doRetweet () {
      if (!this.status.repeated) {
        this.$store.dispatch('retweet', { id: this.status.id })
      } else {
        this.$store.dispatch('unretweet', { id: this.status.id })
      }
      this.animated = true
      setTimeout(() => {
        this.animated = false
      }, 500)
      this.hideConfirmDialog()
    },
    showConfirmDialog () {
      this.showingConfirmDialog = true
    },
    hideConfirmDialog () {
      this.showingConfirmDialog = false
    }
  },
  computed: {
    mergedConfig () {
      return this.$store.getters.mergedConfig
    },
    remoteInteractionLink () {
      return this.$store.getters.remoteInteractionLink({ statusId: this.status.id })
    },
    shouldConfirmRepeat () {
      return this.mergedConfig.modalOnRepeat
    }
  }
}

export default StatusActionButtons
