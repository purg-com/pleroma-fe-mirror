import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'

import DataImportExportTab from './tabs/data_import_export_tab.vue'
import MutesAndBlocksTab from './tabs/mutes_and_blocks_tab.vue'
import NotificationsTab from './tabs/notifications_tab.vue'
import FilteringTab from './tabs/filtering_tab.vue'
import SecurityTab from './tabs/security_tab/security_tab.vue'
import ProfileTab from './tabs/profile_tab.vue'
import GeneralTab from './tabs/general_tab.vue'
import AppearanceTab from './tabs/appearance_tab.vue'
import VersionTab from './tabs/version_tab.vue'
import ThemeTab from './tabs/theme_tab/theme_tab.vue'
import StyleTab from './tabs/style_tab/style_tab.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faWrench,
  faUser,
  faFilter,
  faPaintBrush,
  faPalette,
  faBell,
  faDownload,
  faEyeSlash,
  faInfo,
  faWindowRestore
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faWrench,
  faUser,
  faFilter,
  faPaintBrush,
  faPalette,
  faBell,
  faDownload,
  faEyeSlash,
  faInfo,
  faWindowRestore
)

const SettingsModalContent = {
  components: {
    TabSwitcher,

    DataImportExportTab,
    MutesAndBlocksTab,
    NotificationsTab,
    FilteringTab,
    SecurityTab,
    ProfileTab,
    GeneralTab,
    AppearanceTab,
    StyleTab,
    VersionTab,
    ThemeTab
  },
  computed: {
    isLoggedIn () {
      return !!this.$store.state.users.currentUser
    },
    open () {
      return this.$store.state.interface.settingsModalState !== 'hidden'
    },
    bodyLock () {
      return this.$store.state.interface.settingsModalState === 'visible'
    },
    expertLevel () {
      return this.$store.state.config.expertLevel
    },
    isMobileLayout () {
      return this.$store.state.interface.layoutType === 'mobile'
    }
  },
  methods: {
    onOpen () {
      const targetTab = this.$store.state.interface.settingsModalTargetTab
      // We're being told to open in specific tab
      if (targetTab) {
        const tabIndex = this.$refs.tabSwitcher.$slots.default().findIndex(elm => {
          return elm.props && elm.props['data-tab-name'] === targetTab
        })
        if (tabIndex >= 0) {
          this.$refs.tabSwitcher.setTab(tabIndex)
        }
      }
      // Clear the state of target tab, so that next time settings is opened
      // it doesn't force it.
      this.$store.dispatch('clearSettingsModalTargetTab')
    }
  },
  mounted () {
    this.onOpen()
  },
  watch: {
    open: function (value) {
      if (value) this.onOpen()
    }
  }
}

export default SettingsModalContent
