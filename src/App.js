import UserPanel from './components/user_panel/user_panel.vue'
import NavPanel from './components/nav_panel/nav_panel.vue'
import InstanceSpecificPanel from './components/instance_specific_panel/instance_specific_panel.vue'
import FeaturesPanel from './components/features_panel/features_panel.vue'
import WhoToFollowPanel from './components/who_to_follow_panel/who_to_follow_panel.vue'
import ShoutPanel from './components/shout_panel/shout_panel.vue'
import MediaModal from './components/media_modal/media_modal.vue'
import SideDrawer from './components/side_drawer/side_drawer.vue'
import MobilePostStatusButton from './components/mobile_post_status_button/mobile_post_status_button.vue'
import MobileNav from './components/mobile_nav/mobile_nav.vue'
import DesktopNav from './components/desktop_nav/desktop_nav.vue'
import UserReportingModal from './components/user_reporting_modal/user_reporting_modal.vue'
import EditStatusModal from './components/edit_status_modal/edit_status_modal.vue'
import PostStatusModal from './components/post_status_modal/post_status_modal.vue'
import StatusHistoryModal from './components/status_history_modal/status_history_modal.vue'
import GlobalNoticeList from './components/global_notice_list/global_notice_list.vue'
import { windowWidth, windowHeight } from './services/window_utils/window_utils'
import { mapGetters } from 'vuex'
import { defineAsyncComponent } from 'vue'
import { useShoutStore } from './stores/shout'
import { useInterfaceStore } from './stores/interface'

export default {
  name: 'app',
  components: {
    UserPanel,
    NavPanel,
    Notifications: defineAsyncComponent(() => import('./components/notifications/notifications.vue')),
    InstanceSpecificPanel,
    FeaturesPanel,
    WhoToFollowPanel,
    ShoutPanel,
    MediaModal,
    SideDrawer,
    MobilePostStatusButton,
    MobileNav,
    DesktopNav,
    SettingsModal: defineAsyncComponent(() => import('./components/settings_modal/settings_modal.vue')),
    UpdateNotification: defineAsyncComponent(() => import('./components/update_notification/update_notification.vue')),
    UserReportingModal,
    PostStatusModal,
    EditStatusModal,
    StatusHistoryModal,
    GlobalNoticeList
  },
  data: () => ({
    mobileActivePanel: 'timeline'
  }),
  watch: {
    themeApplied () {
      this.removeSplash()
    },
    layoutType () {
      document.getElementById('modal').classList = ['-' + this.layoutType]
    }
  },
  created () {
    // Load the locale from the storage
    const val = this.$store.getters.mergedConfig.interfaceLanguage
    this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: val })
    window.addEventListener('resize', this.updateMobileState)
    document.getElementById('modal').classList = ['-' + this.layoutType]
  },
  mounted () {
    if (useInterfaceStore().themeApplied) {
      this.removeSplash()
    }
  },
  unmounted () {
    window.removeEventListener('resize', this.updateMobileState)
  },
  computed: {
    themeApplied () {
      return useInterfaceStore().themeApplied
    },
    layoutModalClass () {
      return '-' + this.layoutType
    },
    classes () {
      return [
        {
          '-reverse': this.reverseLayout,
          '-no-sticky-headers': this.noSticky,
          '-has-new-post-button': this.newPostButtonShown
        },
        '-' + this.layoutType
      ]
    },
    navClasses () {
      const { navbarColumnStretch } = this.$store.getters.mergedConfig
      return [
        '-' + this.layoutType,
        ...(navbarColumnStretch ? ['-column-stretch'] : [])
      ]
    },
    currentUser () { return this.$store.state.users.currentUser },
    userBackground () { return this.currentUser.background_image },
    instanceBackground () {
      return this.mergedConfig.hideInstanceWallpaper
        ? null
        : this.$store.state.instance.background
    },
    background () { return this.userBackground || this.instanceBackground },
    bgStyle () {
      if (this.background) {
        return {
          '--body-background-image': `url(${this.background})`
        }
      }
    },
    shout () { return useShoutStore().joined },
    suggestionsEnabled () { return this.$store.state.instance.suggestionsEnabled },
    showInstanceSpecificPanel () {
      return this.$store.state.instance.showInstanceSpecificPanel &&
        !this.$store.getters.mergedConfig.hideISP &&
        this.$store.state.instance.instanceSpecificPanelContent
    },
    isChats () {
      return this.$route.name === 'chat' || this.$route.name === 'chats'
    },
    isListEdit () {
      return this.$route.name === 'lists-edit'
    },
    newPostButtonShown () {
      if (this.isChats) return false
      if (this.isListEdit) return false
      return this.$store.getters.mergedConfig.alwaysShowNewPostButton || this.layoutType === 'mobile'
    },
    showFeaturesPanel () { return this.$store.state.instance.showFeaturesPanel },
    editingAvailable () { return this.$store.state.instance.editingAvailable },
    shoutboxPosition () {
      return this.$store.getters.mergedConfig.alwaysShowNewPostButton || false
    },
    hideShoutbox () {
      return this.$store.getters.mergedConfig.hideShoutbox
    },
    layoutType () { return useInterfaceStore().layoutType },
    privateMode () { return this.$store.state.instance.private },
    reverseLayout () {
      const { thirdColumnMode, sidebarRight: reverseSetting } = this.$store.getters.mergedConfig
      if (this.layoutType !== 'wide') {
        return reverseSetting
      } else {
        return thirdColumnMode === 'notifications' ? reverseSetting : !reverseSetting
      }
    },
    noSticky () { return this.$store.getters.mergedConfig.disableStickyHeaders },
    showScrollbars () { return this.$store.getters.mergedConfig.showScrollbars },
    ...mapGetters(['mergedConfig'])
  },
  methods: {
    updateMobileState () {
      useInterfaceStore().setLayoutWidth(windowWidth())
      useInterfaceStore().setLayoutHeight(windowHeight())
    },
    removeSplash () {
      document.querySelector('#status').textContent = this.$t('splash.fun_' + Math.ceil(Math.random() * 4))
      const splashscreenRoot = document.querySelector('#splash')
      splashscreenRoot.addEventListener('transitionend', () => {
        splashscreenRoot.remove()
      })
      splashscreenRoot.classList.add('hidden')
      document.querySelector('#app').classList.remove('hidden')
    }
  }
}
