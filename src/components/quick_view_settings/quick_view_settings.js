import Popover from 'src/components/popover/popover.vue'
import QuickFilterSettings from 'src/components/quick_filter_settings/quick_filter_settings.vue'
import { mapGetters, mapState } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faList, faFolderTree, faBars, faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(
  faList,
  faFolderTree,
  faBars,
  faWrench
)

const QuickViewSettings = {
  props: {
    conversation: Boolean
  },
  components: {
    Popover,
    QuickFilterSettings
  },
  methods: {
    setConversationDisplay (visibility) {
      this.$store.dispatch('setOption', { name: 'conversationDisplay', value: visibility })
    },
    openTab (tab) {
      this.$store.dispatch('openSettingsModalTab', tab)
    }
  },
  computed: {
    ...mapGetters(['mergedConfig']),
    ...mapState({
      mobileLayout: state => state.interface.layoutType === 'mobile'
    }),
    loggedIn () {
      return !!this.$store.state.users.currentUser
    },
    conversationDisplay: {
      get () { return this.mergedConfig.conversationDisplay },
      set (newVal) { this.setConversationDisplay(newVal) }
    },
    autoUpdate: {
      get () { return this.mergedConfig.streaming },
      set () {
        const value = !this.autoUpdate
        this.$store.dispatch('setOption', { name: 'streaming', value })
      }
    },
    collapseWithSubjects: {
      get () { return this.mergedConfig.collapseMessageWithSubject },
      set () {
        const value = !this.collapseWithSubjects
        this.$store.dispatch('setOption', { name: 'collapseMessageWithSubject', value })
      }
    },
    showUserAvatars: {
      get () { return this.mergedConfig.mentionLinkShowAvatar },
      set () {
        const value = !this.showUserAvatars
        this.$store.dispatch('setOption', { name: 'mentionLinkShowAvatar', value })
      }
    },
    muteBotStatuses: {
      get () { return this.mergedConfig.muteBotStatuses },
      set () {
        const value = !this.muteBotStatuses
        this.$store.dispatch('setOption', { name: 'muteBotStatuses', value })
      }
    },
    muteSensitiveStatuses: {
      get () { return this.mergedConfig.muteSensitiveStatuses },
      set () {
        const value = !this.muteSensitiveStatuses
        this.$store.dispatch('setOption', { name: 'muteSensitiveStatuses', value })
      }
    }
  }
}

export default QuickViewSettings
