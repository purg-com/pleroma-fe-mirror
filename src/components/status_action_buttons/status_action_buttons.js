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
    emit('toggleReplying')
    return Promise.resolve()
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
  counter: ({ status }) => status.repeat_num,
  anonLink: true,
  interactive: ({ status }) => !PRIVATE_SCOPES.has(status.visibility),
  toggleable: true,
  confirm: ({ status, getters }) => !status.repeated && getters.mergedConfig.modalOnRepeat,
  confirmStrings: {
    title: 'status.repeat_confirm_title',
    confirm: 'status.repeat_confirm_accept_button',
    cancel: 'status.repeat_confirm_cancel_button'
  },
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
  icon: ({ status }) => status.favorited
    ? ['fas', 'star']
    : ['far', 'star'],
  animated: true,
  active: ({ status }) => status.favorited,
  counter: ({ status }) => status.fave_num,
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
  icon: ['far', 'smile-beam'],
  anonLink: true,
  popover: 'emoji-picker'
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
  },
  popover: 'bookmark-folders'
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
  confirmStrings: {
    title: 'status.delete_confirm_title',
    confirm: 'status.delete_confirm_cancel_button',
    cancel: 'status.delete_confirm_accept_button'
  },
  action ({ dispatch, status }) {
    return dispatch('deleteStatus', { id: status.id })
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
    return Promise.resolve()
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
  label: 'user_card.report',
  if: ({ loggedIn }) => loggedIn,
  action ({ dispatch, status }) {
    dispatch('openUserReportingModal', { userId: status.user.id, statusIds: [status.id] })
  }
}].map(button => {
  return Object.fromEntries(
    Object.entries(button).map(([k, v]) => [k, typeof v === 'function' ? v : () => v])
  )
})

const StatusActionButtons = {
  props: ['status', 'replying'],
  emits: ['toggleReplying'],
  data () {
    return {
      showingConfirmDialog: false,
      currentConfirmTitle: '',
      currentConfirmOkText: '',
      currentConfirmCancelText: '',
      currentConfirmAction: () => {}
    }
  },
  components: {
    ConfirmModal
  },
  computed: {
    buttons () {
      return BUTTONS.filter(x => x.if(this.funcArg))
    },
    funcArg () {
      return {
        status: this.status,
        replying: this.replying,
        emit: this.$emit,
        dispatch: this.$store.dispatch,
        state: this.$store.state,
        getters: this.$store.getters,
        router: this.$router,
        currentUser: this.$store.state.users.currentUser,
        loggedIn: !!this.$store.state.users.currentUser
      }
    }
  },
  methods: {
    doAction (button) {
      this.doActionReal(button)
    },
    doActionReal (button) {
      button.action(this.funcArg(button))
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    component (button) {
      if (!this.$store.state.users.currentUser && button.anonLink) {
        return 'a'
      } else if (button.action == null && button.link != null) {
        return 'a'
      } else {
        return 'button'
      }
    },
    getClass (button) {
      return {
        [button.name() + '-button']: true,
        '-active': button.active?.(this.funcArg()),
        '-interactive': !!this.$store.state.users.currentUser
      }
    },
    getRemoteInteractionLink () {
      return this.$store.getters.remoteInteractionLink({ statusId: this.status.id })
    }
  }
}

export default StatusActionButtons
