import apiService from '../../services/api/api.service.js'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { shuffle } from 'lodash'

function showWhoToFollow (panel, reply) {
  const shuffled = shuffle(reply)

  panel.usersToFollow.forEach((toFollow, index) => {
    const user = shuffled[index]
    const img = user.avatar || this.$store.state.instance.defaultAvatar
    const name = user.acct

    toFollow.img = img
    toFollow.name = name

    panel.$store.state.api.backendInteractor.fetchUser({ id: name })
      .then((externalUser) => {
        if (!externalUser.error) {
          panel.$store.commit('addNewUsers', [externalUser])
          toFollow.id = externalUser.id
        }
      })
  })
}

function getWhoToFollow (panel) {
  const credentials = panel.$store.state.users.currentUser.credentials
  if (credentials) {
    panel.usersToFollow.forEach(toFollow => {
      toFollow.name = 'Loading...'
    })
    apiService.suggestions({ credentials })
      .then((reply) => {
        showWhoToFollow(panel, reply)
      })
  }
}

const WhoToFollowPanel = {
  data: () => ({
    usersToFollow: []
  }),
  computed: {
    user: function () {
      return this.$store.state.users.currentUser.screen_name
    },
    suggestionsEnabled () {
      return this.$store.state.instance.suggestionsEnabled
    }
  },
  methods: {
    userProfileLink (id, name) {
      return generateProfileLink(id, name, this.$store.state.instance.restrictedNicknames)
    }
  },
  watch: {
    user: function () {
      if (this.suggestionsEnabled) {
        getWhoToFollow(this)
      }
    }
  },
  mounted:
    function () {
      this.usersToFollow = new Array(3).fill().map(() => (
        {
          img: this.$store.state.instance.defaultAvatar,
          name: '',
          id: 0
        }
      ))
      if (this.suggestionsEnabled) {
        getWhoToFollow(this)
      }
    }
}

export default WhoToFollowPanel
