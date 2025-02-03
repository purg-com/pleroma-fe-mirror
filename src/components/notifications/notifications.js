import { computed } from 'vue'
import { mapGetters } from 'vuex'
import { mapState } from 'pinia'
import Notification from '../notification/notification.vue'
import ExtraNotifications from '../extra_notifications/extra_notifications.vue'
import NotificationFilters from './notification_filters.vue'
import notificationsFetcher from '../../services/notifications_fetcher/notifications_fetcher.service.js'
import {
  notificationsFromStore,
  filteredNotificationsFromStore,
  unseenNotificationsFromStore,
  countExtraNotifications,
  ACTIONABLE_NOTIFICATION_TYPES
} from '../../services/notification_utils/notification_utils.js'
import FaviconService from '../../services/favicon_service/favicon_service.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons'
import { useInterfaceStore } from 'src/stores/interface'
import { useAnnouncementsStore } from 'src/stores/announcements'

library.add(
  faCircleNotch,
  faArrowUp,
  faMinus
)

const DEFAULT_SEEN_TO_DISPLAY_COUNT = 30

const Notifications = {
  components: {
    Notification,
    NotificationFilters,
    ExtraNotifications
  },
  props: {
    // Disables panel styles, unread mark, potentially other notification-related actions
    // meant for "Interactions" timeline
    minimalMode: Boolean,
    // Custom filter mode, an array of strings, possible values 'mention', 'status', 'repeat', 'like', 'follow', used to override global filter for use in "Interactions" timeline
    filterMode: Array,
    // Do not show extra notifications
    noExtra: {
      type: Boolean,
      default: false
    },
    // Disable teleporting (i.e. for /users/user/notifications)
    disableTeleport: Boolean
  },
  data () {
    return {
      showScrollTop: false,
      bottomedOut: false,
      // How many seen notifications to display in the list. The more there are,
      // the heavier the page becomes. This count is increased when loading
      // older notifications, and cut back to default whenever hitting "Read!".
      seenToDisplayCount: DEFAULT_SEEN_TO_DISPLAY_COUNT
    }
  },
  provide () {
    return {
      popoversZLayer: computed(() => this.popoversZLayer)
    }
  },
  computed: {
    mainClass () {
      return this.minimalMode ? '' : 'panel panel-default'
    },
    notifications () {
      return notificationsFromStore(this.$store)
    },
    error () {
      return this.$store.state.notifications.error
    },
    unseenNotifications () {
      return unseenNotificationsFromStore(this.$store)
    },
    filteredNotifications () {
      if (this.unseenAtTop) {
        return [
          ...filteredNotificationsFromStore(this.$store).filter(n => this.shouldShowUnseen(n)),
          ...filteredNotificationsFromStore(this.$store).filter(n => !this.shouldShowUnseen(n))
        ]
      } else {
        return filteredNotificationsFromStore(this.$store, this.filterMode)
      }
    },
    unseenCountBadgeText () {
      return `${this.unseenCount ? this.unseenCount : ''}${this.extraNotificationsCount ? '*' : ''}`
    },
    unseenCount () {
      return this.unseenNotifications.length
    },
    ignoreInactionableSeen () { return this.$store.getters.mergedConfig.ignoreInactionableSeen },
    extraNotificationsCount () {
      return countExtraNotifications(this.$store)
    },
    unseenCountTitle () {
      return this.unseenNotifications.length + (this.unreadChatCount) + this.unreadAnnouncementCount
    },
    loading () {
      return this.$store.state.notifications.loading
    },
    noHeading () {
      const { layoutType } = useInterfaceStore()
      return this.minimalMode || layoutType === 'mobile'
    },
    teleportTarget () {
      const { layoutType } = useInterfaceStore()
      const map = {
        wide: '#notifs-column',
        mobile: '#mobile-notifications'
      }
      return map[layoutType] || '#notifs-sidebar'
    },
    popoversZLayer () {
      const { layoutType } = useInterfaceStore()
      return layoutType === 'mobile' ? 'navbar' : null
    },
    notificationsToDisplay () {
      return this.filteredNotifications.slice(0, this.unseenCount + this.seenToDisplayCount)
    },
    noSticky () { return this.$store.getters.mergedConfig.disableStickyHeaders },
    unseenAtTop () { return this.$store.getters.mergedConfig.unseenAtTop },
    showExtraNotifications () {
      return !this.noExtra
    },
    ...mapState(useAnnouncementsStore, ['unreadAnnouncementCount']),
    ...mapGetters(['unreadChatCount'])
  },
  mounted () {
    this.scrollerRef = this.$refs.root.closest('.column.-scrollable')
    if (!this.scrollerRef) {
      this.scrollerRef = this.$refs.root.closest('.mobile-notifications')
    }
    if (!this.scrollerRef) {
      this.scrollerRef = this.$refs.root.closest('.column.main')
    }
    this.scrollerRef.addEventListener('scroll', this.updateScrollPosition)
  },
  unmounted () {
    if (!this.scrollerRef) return
    this.scrollerRef.removeEventListener('scroll', this.updateScrollPosition)
  },
  watch: {
    unseenCountTitle (count) {
      if (count > 0) {
        FaviconService.drawFaviconBadge()
        useInterfaceStore().setPageTitle(`(${count})`)
      } else {
        FaviconService.clearFaviconBadge()
        useInterfaceStore().setPageTitle('')
      }
    },
    teleportTarget () {
      // handle scroller change
      this.$nextTick(() => {
        this.scrollerRef.removeEventListener('scroll', this.updateScrollPosition)
        this.scrollerRef = this.$refs.root.closest('.column.-scrollable')
        if (!this.scrollerRef) {
          this.scrollerRef = this.$refs.root.closest('.mobile-notifications')
        }
        this.scrollerRef.addEventListener('scroll', this.updateScrollPosition)
        this.updateScrollPosition()
      })
    }
  },
  methods: {
    scrollToTop () {
      const scrollable = this.scrollerRef
      scrollable.scrollTo({ top: this.$refs.root.offsetTop })
    },
    updateScrollPosition () {
      this.showScrollTop = this.$refs.root.offsetTop < this.scrollerRef.scrollTop
    },
    shouldShowUnseen (notification) {
      if (notification.seen) return false

      const actionable = ACTIONABLE_NOTIFICATION_TYPES.has(notification.type)
      return this.ignoreInactionableSeen ? actionable : true
    },
    /* "Interacted" really refers to "actionable" notifications that require user input,
     * everything else (likes/repeats/reacts) cannot be acted and therefore we just clear
     * the "seen" status upon any clicks on them
     */
    notificationClicked (notification) {
      const { id } = notification
      this.$store.dispatch('notificationClicked', { id })
    },
    notificationInteracted (notification) {
      const { id } = notification
      this.$store.dispatch('markSingleNotificationAsSeen', { id })
    },
    markAsSeen () {
      this.$store.dispatch('markNotificationsAsSeen')
      this.seenToDisplayCount = DEFAULT_SEEN_TO_DISPLAY_COUNT
    },
    fetchOlderNotifications () {
      if (this.loading) {
        return
      }

      const seenCount = this.filteredNotifications.length - this.unseenCount
      if (this.seenToDisplayCount < seenCount) {
        this.seenToDisplayCount = Math.min(this.seenToDisplayCount + 20, seenCount)
        return
      } else if (this.seenToDisplayCount > seenCount) {
        this.seenToDisplayCount = seenCount
      }

      const store = this.$store
      const credentials = store.state.users.currentUser.credentials
      store.commit('setNotificationsLoading', { value: true })
      notificationsFetcher.fetchAndUpdate({
        store,
        credentials,
        older: true
      }).then(notifs => {
        store.commit('setNotificationsLoading', { value: false })
        if (notifs.length === 0) {
          this.bottomedOut = true
        }
        this.seenToDisplayCount += notifs.length
      })
    }
  }
}

export default Notifications
