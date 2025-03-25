import mfaApi from '../../services/new_api/mfa.js'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { mapStores } from 'pinia'
import { useOAuthStore } from 'src/stores/oauth.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTimes
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faTimes
)

export default {
  data: () => ({
    code: null,
    error: false
  }),
  computed: {
    ...mapGetters({
      authSettings: 'authFlow/settings'
    }),
    ...mapStores(useOAuthStore),
    ...mapState({
      instance: 'instance',
    })
  },
  methods: {
    ...mapMutations('authFlow', ['requireRecovery', 'abortMFA']),
    ...mapActions({ login: 'authFlow/login' }),
    clearError () { this.error = false },
    submit () {
      const { clientId, clientSecret } = this.oauthStore

      const data = {
        clientId,
        clientSecret,
        instance: this.instance.server,
        mfaToken: this.authSettings.mfa_token,
        code: this.code
      }

      mfaApi.verifyOTPCode(data).then((result) => {
        if (result.error) {
          this.error = result.error
          this.code = null
          return
        }

        this.login(result).then(() => {
          this.$router.push({ name: 'friends' })
        })
      })
    }
  }
}
