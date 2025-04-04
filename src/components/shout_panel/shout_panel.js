import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBullhorn,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import { useShoutStore } from 'src/stores/shout'

library.add(
  faBullhorn,
  faTimes
)

const shoutPanel = {
  props: ['floating'],
  data () {
    return {
      currentMessage: '',
      channel: null,
      collapsed: true
    }
  },
  computed: {
    messages () {
      return useShoutStore().messages
    }
  },
  methods: {
    submit (message) {
      useShoutStore().channel.push('new_msg', { text: message }, 10000)
      this.currentMessage = ''
    },
    togglePanel () {
      this.collapsed = !this.collapsed
    },
    userProfileLink (user) {
      return generateProfileLink(user.id, user.username, this.$store.state.instance.restrictedNicknames)
    }
  },
  watch: {
    messages () {
      const scrollEl = this.$el.querySelector('.chat-window')
      if (!scrollEl) return
      if (scrollEl.scrollTop + scrollEl.offsetHeight + 20 > scrollEl.scrollHeight) {
        this.$nextTick(() => {
          if (!scrollEl) return
          scrollEl.scrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight
        })
      }
    }
  }
}

export default shoutPanel
