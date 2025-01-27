import { unitToSeconds } from 'src/services/date_utils/date_utils.js'
import { mapGetters } from 'vuex'

import ConfirmModal from './confirm_modal.vue'
import Select from 'src/components/select/select.vue'

export default {
  props: ['type', 'user', 'status'],
  emits: ['hide', 'show', 'muted'],
  data: () => ({
    showing: false,
    muteExpiryAmount: 2,
    muteExpiryUnit: 'hours'
  }),
  components: {
    ConfirmModal,
    Select
  },
  computed: {
    muteExpiryValue () {
      unitToSeconds(this.muteExpiryUnit, this.muteExpiryAmount)
    },
    muteExpiryUnits () {
      return ['minutes', 'hours', 'days']
    },
    domain () {
      return this.user.fqn.split('@')[1]
    },
    keypath () {
      if (this.type === 'domain') {
        return 'status.mute_domain_confirm'
      } else if (this.type === 'conversation') {
        return 'status.mute_conversation_confirm'
      } else {
        return 'user_card.mute_confirm'
      }
    },
    userIsMuted () {
      return this.$store.getters.relationship(this.user.id).muting
    },
    conversationIsMuted () {
      return this.status.conversation_muted
    },
    domainIsMuted () {
      return new Set(this.$store.state.users.currentUser.domainMutes).has(this.domain)
    },
    shouldConfirm () {
      switch (this.type) {
        case 'domain': {
          return this.mergedConfig.modalOnMuteDomain
        }
        case 'conversation': {
          return this.mergedConfig.modalOnMuteConversation
        }
        default: {
          return this.mergedConfig.modalOnMute
        }
      }
    },
    ...mapGetters(['mergedConfig'])
  },
  methods: {
    optionallyPrompt () {
      console.log('Triggered')
      if (this.shouldConfirm) {
        console.log('SHAWN!!')
        this.show()
      } else {
        this.doMute()
      }
    },
    show () {
      this.showing = true
      this.$emit('show')
    },
    hide () {
      this.showing = false
      this.$emit('hide')
    },
    doMute () {
      switch (this.type) {
        case 'domain': {
          if (!this.domainIsMuted) {
            this.$store.dispatch('muteDomain', { id: this.domain, expiresIn: this.muteExpiryValue })
          } else {
            this.$store.dispatch('unmuteDomain', { id: this.domain })
          }
          break
        }
        case 'conversation': {
          if (!this.conversationIsMuted) {
            this.$store.dispatch('muteConversation', { id: this.status.id, expiresIn: this.muteExpiryValue })
          } else {
            this.$store.dispatch('unmuteConversation', { id: this.status.id })
          }
          break
        }
        default: {
          if (!this.userIsMuted) {
            this.$store.dispatch('muteUser', { id: this.user.id, expiresIn: this.muteExpiryValue })
          } else {
            this.$store.dispatch('unmuteUser', { id: this.user.id })
          }
          break
        }
      }
      this.$emit('muted')
      this.hide()
    }
  }
}
