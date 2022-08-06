import Popover from '../popover/popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  faBookmark as faBookmarkReg,
  faFlag
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faEllipsisH,
  faBookmark,
  faBookmarkReg,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faFlag
)

const ExtraButtons = {
  props: ['status'],
  components: { Popover },
  methods: {
    deleteStatus () {
      const confirmed = window.confirm(this.$t('status.delete_confirm'))
      if (confirmed) {
        this.$store.dispatch('deleteStatus', { id: this.status.id })
      }
    },
    pinStatus () {
      this.$store.dispatch('pinStatus', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unpinStatus () {
      this.$store.dispatch('unpinStatus', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    muteConversation () {
      this.$store.dispatch('muteConversation', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unmuteConversation () {
      this.$store.dispatch('unmuteConversation', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    copyLink () {
      navigator.clipboard.writeText(this.statusLink)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    bookmarkStatus () {
      this.$store.dispatch('bookmark', { id: this.status.id })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unbookmarkStatus () {
      this.$store.dispatch('unbookmark', { id: this.status.id })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    reportStatus () {
      this.$store.dispatch('openUserReportingModal', { userId: this.status.user.id, statusIds: [this.status.id] })
    }
  },
  computed: {
    currentUser () { return this.$store.state.users.currentUser },
    canDelete () {
      if (!this.currentUser) { return }
      return this.currentUser.privileges.includes('messages_delete') || this.status.user.id === this.currentUser.id
    },
    ownStatus () {
      return this.status.user.id === this.currentUser.id
    },
    canPin () {
      return this.ownStatus && (this.status.visibility === 'public' || this.status.visibility === 'unlisted')
    },
    canMute () {
      return !!this.currentUser
    },
    canBookmark () {
      return !!this.currentUser
    },
    statusLink () {
      return `${this.$store.state.instance.server}${this.$router.resolve({ name: 'conversation', params: { id: this.status.id } }).href}`
    }
  }
}

export default ExtraButtons
