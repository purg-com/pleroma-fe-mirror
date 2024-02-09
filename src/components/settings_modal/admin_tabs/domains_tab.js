import Checkbox from 'src/components/checkbox/checkbox.vue'
import Domain from 'src/components/domain/domain.vue'
import PanelLoading from 'src/components/panel_loading/panel_loading.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'

const DomainsTab = {
  provide () {
    return {
      defaultDraftMode: true,
      defaultSource: 'admin'
    }
  },
  data () {
    return {
      working: false,
      domain: {
        domain: '',
        public: false
      },
      error: ''
    }
  },
  components: {
    PanelLoading,
    Domain,
    Checkbox
  },
  created () {
    if (this.user.rights.admin) {
      this.$store.dispatch('loadDomainsStuff')
    }
  },
  computed: {
    domains () {
      return this.$store.state.adminSettings.domains
    },
    ...SharedComputedObject()
  },
  methods: {
    submitDomain () {
      this.$store.dispatch('createDomain', this.domain)
        .then(() => {
          this.domain = {}
        })
        .catch(error => {
          this.error = error.error
        })
    }
  }
}

export default DomainsTab
