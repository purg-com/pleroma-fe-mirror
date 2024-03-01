import { mapState } from 'vuex'
import localeService from '../../services/locale/locale.service.js'

const Announcement = {
  props: {
    domain: Object
  },
  data () {
    return {
      error: ''
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.users.currentUser
    }),
    domainState () {
      console.log(this.domain)
      return this.domain.public
    },
    domainName () {
      return this.domain.domain
    },
    lastCheckedAt () {
      const time = this.domain.last_checked_at
      if (!time) {
        return
      }

      const d = new Date(time)

      return d.toLocaleString(localeService.internalToBrowserLocale(this.$i18n.locale))
    },
    resolves () {
      return this.domain.resolves
    }
  },
  methods: {
    switchState () {
      return this.$store.dispatch('editDomain', { id: this.domain.id, state: !this.domain.public })
        .catch(error => {
          this.error = error.error
        })
    },
    deleteDomain () {
      return this.$store.dispatch('deleteDomain', { id: this.domain.id })
        .catch(error => {
          this.error = error.error
        })
    },
    clearError () {
      this.error = undefined
    }
  }
}

export default Announcement
