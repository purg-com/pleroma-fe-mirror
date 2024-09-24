import GlobalNoticeList from 'src/components/global_notice_list/global_notice_list.vue'
import SettingsModalAdminContent from 'src/components/settings_modal/settings_modal_admin_content.vue'

export default {
  name: 'app',
  components: {
    SettingsModalAdminContent,
    GlobalNoticeList
  },
  data: () => ({
    mobileActivePanel: 'timeline'
  }),
  created () {
    // Load the locale from the storage
    this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: 'en_US' })
  },
  computed: {
    currentUser () {
      console.log({ ...this.$store.state })
      return this.$store.state.users.currentUser
    }
  }
}
