import { mapState } from 'vuex'
import Announcement from '../announcement/announcement.vue'
import AnnouncementEditor from '../announcement_editor/announcement_editor.vue'
import { useAnnouncementsStore } from 'src/stores/announcements'

const AnnouncementsPage = {
  components: {
    Announcement,
    AnnouncementEditor
  },
  data () {
    return {
      newAnnouncement: {
        content: '',
        startsAt: undefined,
        endsAt: undefined,
        allDay: false
      },
      posting: false,
      error: undefined
    }
  },
  mounted () {
    useAnnouncementsStore().fetchAnnouncements()
  },
  computed: {
    ...mapState({
      currentUser: state => state.users.currentUser
    }),
    announcements () {
      return useAnnouncementsStore().announcements
    },
    canPostAnnouncement () {
      return this.currentUser && this.currentUser.privileges.includes('announcements_manage_announcements')
    }
  },
  methods: {
    postAnnouncement () {
      this.posting = true
      useAnnouncementsStore().postAnnouncement(this.newAnnouncement)
        .then(() => {
          this.newAnnouncement.content = ''
          this.startsAt = undefined
          this.endsAt = undefined
        })
        .catch(error => {
          this.error = error.error
        })
        .finally(() => {
          this.posting = false
        })
    },
    clearError () {
      this.error = undefined
    }
  }
}

export default AnnouncementsPage
