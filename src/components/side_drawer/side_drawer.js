import { mapState, mapGetters } from 'vuex'
import { mapState as mapPiniaState } from 'pinia'
import UserCard from '../user_card/user_card.vue'
import { unseenNotificationsFromStore } from '../../services/notification_utils/notification_utils'
import GestureService from '../../services/gesture_service/gesture_service'
import { USERNAME_ROUTES } from 'src/components/navigation/navigation.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSignInAlt,
  faSignOutAlt,
  faHome,
  faComments,
  faBell,
  faUserPlus,
  faBullhorn,
  faSearch,
  faTachometerAlt,
  faCog,
  faInfoCircle,
  faCompass,
  faList,
  faFilePen
} from '@fortawesome/free-solid-svg-icons'
import { useShoutStore } from 'src/stores/shout'
import { useInterfaceStore } from 'src/stores/interface'
import { useAnnouncementsStore } from 'src/stores/announcements'

library.add(
  faSignInAlt,
  faSignOutAlt,
  faHome,
  faComments,
  faBell,
  faUserPlus,
  faBullhorn,
  faSearch,
  faTachometerAlt,
  faCog,
  faInfoCircle,
  faCompass,
  faList,
  faFilePen
)

const SideDrawer = {
  props: ['logout'],
  data: () => ({
    closed: true,
    closeGesture: undefined
  }),
  created () {
    this.closeGesture = GestureService.swipeGesture(GestureService.DIRECTION_LEFT, this.toggleDrawer)

    if (this.currentUser && this.currentUser.locked) {
      this.$store.dispatch('startFetchingFollowRequests')
    }
  },
  components: { UserCard },
  computed: {
    currentUser () {
      return this.$store.state.users.currentUser
    },
    shout () { return useShoutStore().joined },
    unseenNotifications () {
      return unseenNotificationsFromStore(this.$store)
    },
    unseenNotificationsCount () {
      return this.unseenNotifications.length
    },
    suggestionsEnabled () {
      return this.$store.state.instance.suggestionsEnabled
    },
    logo () {
      return this.$store.state.instance.logo
    },
    hideSitename () {
      return this.$store.state.instance.hideSitename
    },
    sitename () {
      return this.$store.state.instance.name
    },
    followRequestCount () {
      return this.$store.state.api.followRequests.length
    },
    privateMode () {
      return this.$store.state.instance.private
    },
    federating () {
      return this.$store.state.instance.federating
    },
    timelinesRoute () {
      let name
      if (useInterfaceStore().lastTimeline) {
        name = useInterfaceStore().lastTimeline
      }
      name = this.currentUser ? 'friends' : 'public-timeline'
      if (USERNAME_ROUTES.has(name)) {
        return { name, params: { username: this.currentUser.screen_name } }
      } else {
        return { name }
      }
    },
    ...mapPiniaState(useAnnouncementsStore, {
      supportsAnnouncements: store => store.supportsAnnouncements,
      unreadAnnouncementCount: 'unreadAnnouncementCount'
    }),
    ...mapState({
      pleromaChatMessagesAvailable: state => state.instance.pleromaChatMessagesAvailable
    }),
    ...mapGetters(['unreadChatCount', 'draftCount'])
  },
  methods: {
    toggleDrawer () {
      this.closed = !this.closed
    },
    doLogout () {
      this.logout()
      this.toggleDrawer()
    },
    touchStart (e) {
      GestureService.beginSwipe(e, this.closeGesture)
    },
    touchMove (e) {
      GestureService.updateSwipe(e, this.closeGesture)
    },
    openSettingsModal () {
      useInterfaceStore().openSettingsModal('user')
    },
    openAdminModal () {
      useInterfaceStore().openSettingsModal('admin')
    }
  }
}

export default SideDrawer
