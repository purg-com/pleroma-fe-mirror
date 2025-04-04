import PostStatusForm from '../post_status_form/post_status_form.vue'
import UserAvatar from '../user_avatar/user_avatar.vue'
import AvatarList from '../avatar_list/avatar_list.vue'
import Timeago from '../timeago/timeago.vue'
import StatusContent from '../status_content/status_content.vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import StatusPopover from '../status_popover/status_popover.vue'
import UserPopover from '../user_popover/user_popover.vue'
import UserListPopover from '../user_list_popover/user_list_popover.vue'
import EmojiReactions from '../emoji_reactions/emoji_reactions.vue'
import UserLink from '../user_link/user_link.vue'
import MentionsLine from 'src/components/mentions_line/mentions_line.vue'
import MentionLink from 'src/components/mention_link/mention_link.vue'
import StatusActionButtons from 'src/components/status_action_buttons/status_action_buttons.vue'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { highlightClass, highlightStyle } from '../../services/user_highlighter/user_highlighter.js'
import { muteWordHits } from '../../services/status_parser/status_parser.js'
import { unescape, uniqBy } from 'lodash'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEnvelope,
  faLock,
  faLockOpen,
  faGlobe,
  faTimes,
  faRetweet,
  faReply,
  faPlusSquare,
  faSmileBeam,
  faEllipsisH,
  faStar,
  faEyeSlash,
  faEye,
  faThumbtack,
  faChevronUp,
  faChevronDown,
  faAngleDoubleRight,
  faPlay
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEnvelope,
  faGlobe,
  faLock,
  faLockOpen,
  faTimes,
  faRetweet,
  faReply,
  faPlusSquare,
  faStar,
  faSmileBeam,
  faEllipsisH,
  faEyeSlash,
  faEye,
  faThumbtack,
  faChevronUp,
  faChevronDown,
  faAngleDoubleRight,
  faPlay
)

const camelCase = name => name.charAt(0).toUpperCase() + name.slice(1)

const controlledOrUncontrolledGetters = list => list.reduce((res, name) => {
  const camelized = camelCase(name)
  const toggle = `controlledToggle${camelized}`
  const controlledName = `controlled${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  res[name] = function () {
    return ((this.$data[toggle] !== undefined || this.$props[toggle] !== undefined) && this[toggle]) ? this[controlledName] : this[uncontrolledName]
  }
  return res
}, {})

const controlledOrUncontrolledToggle = (obj, name) => {
  const camelized = camelCase(name)
  const toggle = `controlledToggle${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  if (obj[toggle]) {
    obj[toggle]()
  } else {
    obj[uncontrolledName] = !obj[uncontrolledName]
  }
}

const controlledOrUncontrolledSet = (obj, name, val) => {
  const camelized = camelCase(name)
  const set = `controlledSet${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  if (obj[set]) {
    obj[set](val)
  } else {
    obj[uncontrolledName] = val
  }
}

const Status = {
  name: 'Status',
  components: {
    PostStatusForm,
    UserAvatar,
    AvatarList,
    Timeago,
    StatusPopover,
    UserListPopover,
    EmojiReactions,
    StatusContent,
    RichContent,
    MentionLink,
    MentionsLine,
    UserPopover,
    UserLink,
    StatusActionButtons
  },
  props: [
    'statusoid',
    'expandable',
    'inConversation',
    'focused',
    'highlight',
    'compact',
    'replies',
    'isPreview',
    'noHeading',
    'inlineExpanded',
    'showPinned',
    'inProfile',
    'profileUserId',
    'inQuote',

    'simpleTree',
    'controlledThreadDisplayStatus',
    'controlledToggleThreadDisplay',
    'showOtherRepliesAsButton',

    'controlledShowingTall',
    'controlledToggleShowingTall',
    'controlledExpandingSubject',
    'controlledToggleExpandingSubject',
    'controlledShowingLongSubject',
    'controlledToggleShowingLongSubject',
    'controlledReplying',
    'controlledToggleReplying',
    'controlledMediaPlaying',
    'controlledSetMediaPlaying',
    'dive'
  ],
  emits: ['interacted'],
  data () {
    return {
      uncontrolledReplying: false,
      unmuted: false,
      userExpanded: false,
      uncontrolledMediaPlaying: [],
      suspendable: true,
      error: null,
      headTailLinks: null,
      displayQuote: !this.inQuote
    }
  },
  computed: {
    ...controlledOrUncontrolledGetters(['replying', 'mediaPlaying']),
    muteWords () {
      return this.mergedConfig.muteWords
    },
    showReasonMutedThread () {
      return (
        this.status.thread_muted ||
          (this.status.reblog && this.status.reblog.thread_muted)
      ) && !this.inConversation
    },
    repeaterClass () {
      const user = this.statusoid.user
      return highlightClass(user)
    },
    userClass () {
      const user = this.retweet ? (this.statusoid.retweeted_status.user) : this.statusoid.user
      return highlightClass(user)
    },
    deleted () {
      return this.statusoid.deleted
    },
    repeaterStyle () {
      const user = this.statusoid.user
      const highlight = this.mergedConfig.highlight
      return highlightStyle(highlight[user.screen_name])
    },
    userStyle () {
      if (this.noHeading) return
      const user = this.retweet ? (this.statusoid.retweeted_status.user) : this.statusoid.user
      const highlight = this.mergedConfig.highlight
      return highlightStyle(highlight[user.screen_name])
    },
    userProfileLink () {
      return this.generateUserProfileLink(this.status.user.id, this.status.user.screen_name)
    },
    replyProfileLink () {
      if (this.isReply) {
        const user = this.$store.getters.findUser(this.status.in_reply_to_user_id)
        // FIXME Why user not found sometimes???
        return user ? user.statusnet_profile_url : 'NOT_FOUND'
      }
    },
    retweet () { return !!this.statusoid.retweeted_status },
    retweeterUser () { return this.statusoid.user },
    retweeter () { return this.statusoid.user.name || this.statusoid.user.screen_name_ui },
    retweeterHtml () { return this.statusoid.user.name },
    retweeterProfileLink () { return this.generateUserProfileLink(this.statusoid.user.id, this.statusoid.user.screen_name) },
    status () {
      if (this.retweet) {
        return this.statusoid.retweeted_status
      } else {
        return this.statusoid
      }
    },
    statusFromGlobalRepository () {
      // NOTE: Consider to replace status with statusFromGlobalRepository
      return this.$store.state.statuses.allStatusesObject[this.status.id]
    },
    loggedIn () {
      return !!this.currentUser
    },
    muteWordHits () {
      return muteWordHits(this.status, this.muteWords)
    },
    botStatus () {
      return this.status.user.actor_type === 'Service'
    },
    showActorTypeIndicator () {
      return !this.hideBotIndication
    },
    sensitiveStatus () {
      return this.status.nsfw
    },
    mentionsLine () {
      if (!this.headTailLinks) return []
      const writtenSet = new Set(this.headTailLinks.writtenMentions.map(_ => _.url))
      return this.status.attentions.filter(attn => {
        // no reply user
        return attn.id !== this.status.in_reply_to_user_id &&
          // no self-replies
          attn.statusnet_profile_url !== this.status.user.statusnet_profile_url &&
          // don't include if mentions is written
          !writtenSet.has(attn.statusnet_profile_url)
      }).map(attn => ({
        url: attn.statusnet_profile_url,
        content: attn.screen_name,
        userId: attn.id
      }))
    },
    hasMentionsLine () {
      return this.mentionsLine.length > 0
    },
    muteReasons () {
      return [
        this.userIsMuted ? 'user' : null,
        this.status.thread_muted ? 'thread' : null,
        (this.muteWordHits.length > 0) ? 'wordfilter' : null,
        (this.muteBotStatuses && this.botStatus) ? 'bot' : null,
        (this.muteSensitiveStatuses && this.sensitiveStatus) ? 'nsfw' : null
      ].filter(_ => _)
    },
    muteLocalized () {
      if (this.muteReasons.length === 0) return null
      const mainReason = () => {
        switch (this.muteReasons[0]) {
          case 'user': return this.$t('status.muted_user')
          case 'thread': return this.$t('status.thread_muted')
          case 'wordfilter':
            return this.$t(
              'status.muted_words',
              {
                word: this.muteWordHits[0],
                numWordsMore: this.muteWordHits.length - 1
              },
              this.muteWordHits.length
            )
          case 'bot': return this.$t('status.bot_muted')
          case 'nsfw': return this.$t('status.sensitive_muted')
        }
      }
      if (this.muteReasons.length > 1) {
        return this.$t(
          'status.multi_reason_mute',
          {
            main: mainReason(),
            numReasonsMore: this.muteReasons.length - 1
          },
          this.muteReasons.length - 1
        )
      } else {
        return mainReason()
      }
    },
    muted () {
      if (this.statusoid.user.id === this.currentUser.id) return false
      return !this.unmuted && !this.shouldNotMute && this.muteReasons.length > 0
    },
    userIsMuted () {
      if (this.statusoid.user.id === this.currentUser.id) return false
      const { status } = this
      const { reblog } = status
      const relationship = this.$store.getters.relationship(status.user.id)
      const relationshipReblog = reblog && this.$store.getters.relationship(reblog.user.id)
      return (status.muted && !status.thread_muted) ||
        // Reprööt of a muted post according to BE
        (reblog && reblog.muted && !reblog.thread_muted) ||
        // Muted user
        relationship.muting ||
        // Muted user of a reprööt
        (relationshipReblog && relationshipReblog.muting)
    },
    shouldNotMute () {
      const { status } = this
      const { reblog } = status
      return (
        (
          this.inProfile && (
            // Don't mute user's posts on user timeline (except reblogs)
            (!reblog && status.user.id === this.profileUserId) ||
            // Same as above but also allow self-reblogs
            (reblog && reblog.user.id === this.profileUserId)
          )
        ) ||
        // Don't mute statuses in muted conversation when said conversation is opened
        (this.inConversation && status.thread_muted)
        // No excuses if post has muted words
      ) && !this.muteWordHits.length > 0
    },
    hideMutedUsers () {
      return this.mergedConfig.hideMutedPosts
    },
    hideMutedThreads () {
      return this.mergedConfig.hideMutedThreads
    },
    hideFilteredStatuses () {
      return this.mergedConfig.hideFilteredStatuses
    },
    hideWordFilteredPosts () {
      return this.mergedConfig.hideWordFilteredPosts
    },
    hideStatus () {
      return (!this.shouldNotMute) && (
        (this.muted && this.hideFilteredStatuses) ||
        (this.userIsMuted && this.hideMutedUsers) ||
        (this.status.thread_muted && this.hideMutedThreads) ||
        (this.muteWordHits.length > 0 && this.hideWordFilteredPosts)
      )
    },
    isFocused () {
      // retweet or root of an expanded conversation
      if (this.focused) {
        return true
      } else if (!this.inConversation) {
        return false
      }
      // use conversation highlight only when in conversation
      return this.status.id === this.highlight
    },
    isReply () {
      return !!(this.status.in_reply_to_status_id && this.status.in_reply_to_user_id)
    },
    replyToName () {
      if (this.status.in_reply_to_screen_name) {
        return this.status.in_reply_to_screen_name
      } else {
        const user = this.$store.getters.findUser(this.status.in_reply_to_user_id)
        return user && user.screen_name_ui
      }
    },
    replySubject () {
      if (!this.status.summary) return ''
      const decodedSummary = unescape(this.status.summary)
      const behavior = this.mergedConfig.subjectLineBehavior
      const startsWithRe = decodedSummary.match(/^re[: ]/i)
      if ((behavior !== 'noop' && startsWithRe) || behavior === 'masto') {
        return decodedSummary
      } else if (behavior === 'email') {
        return 're: '.concat(decodedSummary)
      } else if (behavior === 'noop') {
        return ''
      }
    },
    combinedFavsAndRepeatsUsers () {
      // Use the status from the global status repository since favs and repeats are saved in it
      const combinedUsers = [].concat(
        this.statusFromGlobalRepository.favoritedBy,
        this.statusFromGlobalRepository.rebloggedBy
      )
      return uniqBy(combinedUsers, 'id')
    },
    tags () {
      // eslint-disable-next-line no-prototype-builtins
      return this.status.tags.filter(tagObj => tagObj.hasOwnProperty('name')).map(tagObj => tagObj.name).join(' ')
    },
    hidePostStats () {
      return this.mergedConfig.hidePostStats
    },
    shouldDisplayFavsAndRepeats () {
      return !this.hidePostStats && this.isFocused && (this.combinedFavsAndRepeatsUsers.length > 0 || this.statusFromGlobalRepository.quotes_count)
    },
    muteBotStatuses () {
      return this.mergedConfig.muteBotStatuses
    },
    muteSensitiveStatuses () {
      return this.mergedConfig.muteSensitiveStatuses
    },
    hideBotIndication () {
      return this.mergedConfig.hideBotIndication
    },
    currentUser () {
      return this.$store.state.users.currentUser
    },
    mergedConfig () {
      return this.$store.getters.mergedConfig
    },
    isSuspendable () {
      return !this.replying && this.mediaPlaying.length === 0
    },
    inThreadForest () {
      return !!this.controlledThreadDisplayStatus
    },
    threadShowing () {
      return this.controlledThreadDisplayStatus === 'showing'
    },
    visibilityLocalized () {
      return this.$i18n.t('general.scope_in_timeline.' + this.status.visibility)
    },
    isEdited () {
      return this.status.edited_at !== null
    },
    editingAvailable () {
      return this.$store.state.instance.editingAvailable
    },
    hasVisibleQuote () {
      return this.status.quote_url && this.status.quote_visible
    },
    hasInvisibleQuote () {
      return this.status.quote_url && !this.status.quote_visible
    },
    quotedStatus () {
      return this.status.quote_id ? this.$store.state.statuses.allStatusesObject[this.status.quote_id] : undefined
    },
    shouldDisplayQuote () {
      return this.quotedStatus && this.displayQuote
    },
    scrobblePresent () {
      if (this.mergedConfig.hideScrobbles) return false
      if (!this.status.user.latestScrobble) return false
      const value = this.mergedConfig.hideScrobblesAfter.match(/\d+/gs)[0]
      const unit = this.mergedConfig.hideScrobblesAfter.match(/\D+/gs)[0]
      let multiplier = 60 * 1000 // minutes is smallest unit
      switch (unit) {
        case 'm':
          break
        case 'h':
          multiplier *= 60 // hour
          break
        case 'd':
          multiplier *= 60 // hour
          multiplier *= 24 // day
          break
      }
      const maxAge = Number(value) * multiplier
      const createdAt = Date.parse(this.status.user.latestScrobble.created_at)
      const age = Date.now() - createdAt
      if (age > maxAge) return false
      return this.status.user.latestScrobble.artist
    },
    scrobble () {
      return this.status.user.latestScrobble
    }
  },
  methods: {
    visibilityIcon (visibility) {
      switch (visibility) {
        case 'private':
          return 'lock'
        case 'unlisted':
          return 'lock-open'
        case 'direct':
          return 'envelope'
        default:
          return 'globe'
      }
    },
    showError (error) {
      this.error = error
    },
    clearError () {
      this.$emit('interacted')
      this.error = undefined
    },
    toggleReplying () {
      this.$emit('interacted')
      if (this.replying) {
        this.$refs.postStatusForm.requestClose()
      } else {
        this.doToggleReplying()
      }
    },
    doToggleReplying () {
      controlledOrUncontrolledToggle(this, 'replying')
    },
    gotoOriginal (id) {
      if (this.inConversation) {
        this.$emit('goto', id)
      }
    },
    toggleExpanded () {
      this.$emit('toggleExpanded')
    },
    toggleMute () {
      this.unmuted = !this.unmuted
    },
    toggleUserExpanded () {
      this.userExpanded = !this.userExpanded
    },
    generateUserProfileLink (id, name) {
      return generateProfileLink(id, name, this.$store.state.instance.restrictedNicknames)
    },
    addMediaPlaying (id) {
      controlledOrUncontrolledSet(this, 'mediaPlaying', this.mediaPlaying.concat(id))
    },
    removeMediaPlaying (id) {
      controlledOrUncontrolledSet(this, 'mediaPlaying', this.mediaPlaying.filter(mediaId => mediaId !== id))
    },
    setHeadTailLinks (headTailLinks) {
      this.headTailLinks = headTailLinks
    },
    toggleThreadDisplay () {
      this.controlledToggleThreadDisplay()
    },
    scrollIfHighlighted (highlightId) {
      const id = highlightId
      if (this.status.id === id) {
        const rect = this.$el.getBoundingClientRect()
        if (rect.top < 100) {
          // Post is above screen, match its top to screen top
          window.scrollBy(0, rect.top - 100)
        } else if (rect.height >= (window.innerHeight - 50)) {
          // Post we want to see is taller than screen so match its top to screen top
          window.scrollBy(0, rect.top - 100)
        } else if (rect.bottom > window.innerHeight - 50) {
          // Post is below screen, match its bottom to screen bottom
          window.scrollBy(0, rect.bottom - window.innerHeight + 50)
        }
      }
    },
    toggleDisplayQuote () {
      if (this.shouldDisplayQuote) {
        this.displayQuote = false
      } else if (!this.quotedStatus) {
        this.$store.dispatch('fetchStatus', this.status.quote_id)
          .then(() => {
            this.displayQuote = true
          })
      } else {
        this.displayQuote = true
      }
    }
  },
  watch: {
    highlight: function (id) {
      this.scrollIfHighlighted(id)
    },
    'status.repeat_num': function (num) {
      // refetch repeats when repeat_num is changed in any way
      if (this.isFocused && this.statusFromGlobalRepository.rebloggedBy && this.statusFromGlobalRepository.rebloggedBy.length !== num) {
        this.$store.dispatch('fetchRepeats', this.status.id)
      }
    },
    'status.fave_num': function (num) {
      // refetch favs when fave_num is changed in any way
      if (this.isFocused && this.statusFromGlobalRepository.favoritedBy && this.statusFromGlobalRepository.favoritedBy.length !== num) {
        this.$store.dispatch('fetchFavs', this.status.id)
      }
    },
    isSuspendable: function (val) {
      this.suspendable = val
    }
  }
}

export default Status
