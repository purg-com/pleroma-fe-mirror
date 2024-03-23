import Timeago from 'components/timeago/timeago.vue'
import genRandomSeed from '../../services/random_seed/random_seed.service.js'
import RichContent from 'components/rich_content/rich_content.jsx'

export default {
  name: 'Poll',
  props: ['basePoll', 'emoji'],
  components: {
    Timeago,
    RichContent
  },
  data () {
    return {
      loading: false,
      choices: [],
      randomSeed: genRandomSeed()
    }
  },
  created () {
    if (!this.$store.state.polls.pollsObject[this.pollId]) {
      this.$store.dispatch('mergeOrAddPoll', this.basePoll)
    }
    this.$store.dispatch('trackPoll', this.pollId)
  },
  unmounted () {
    this.$store.dispatch('untrackPoll', this.pollId)
  },
  computed: {
    pollId () {
      return this.basePoll.id
    },
    poll () {
      const storePoll = this.$store.state.polls.pollsObject[this.pollId]
      return storePoll || {}
    },
    options () {
      return (this.poll && this.poll.options) || []
    },
    expiresAt () {
      return (this.poll && this.poll.expires_at) || null
    },
    expired () {
      return (this.poll && this.poll.expired) || false
    },
    loggedIn () {
      return this.$store.state.users.currentUser
    },
    showResults () {
      return this.poll.voted || this.expired || !this.loggedIn
    },
    totalVotesCount () {
      return this.poll.votes_count
    },
    containerClass () {
      return {
        loading: this.loading
      }
    },
    choiceIndices () {
      // Convert array of booleans into an array of indices of the
      // items that were 'true', so [true, false, false, true] becomes
      // [0, 3].
      return this.choices
        .map((entry, index) => entry && index)
        .filter(value => typeof value === 'number')
    },
    isDisabled () {
      const noChoice = this.choiceIndices.length === 0
      return this.loading || noChoice
    }
  },
  methods: {
    percentageForOption (count) {
      return this.totalVotesCount === 0 ? 0 : Math.round(count / this.totalVotesCount * 100)
    },
    resultTitle (option) {
      return `${option.votes_count}/${this.totalVotesCount} ${this.$t('polls.votes')}`
    },
    fetchPoll () {
      this.$store.dispatch('refreshPoll', { id: this.statusId, pollId: this.poll.id })
    },
    activateOption (index) {
      if (this.poll.multiple) {
        // Multiple choice: toggle the current index
        const nextChoices = [...this.choices]
        nextChoices[index] = !nextChoices[index]
        this.choices = nextChoices
      } else {
        // Radio button, uncheck everything and check the clicked one
        const nextChoices = new Array(this.choices.length).fill(false)
        nextChoices[index] = true
        this.choices = nextChoices
      }
    },
    optionId (index) {
      return `poll${this.poll.id}-${index}`
    },
    vote () {
      if (this.choiceIndices.length === 0) return
      this.loading = true
      this.$store.dispatch(
        'votePoll',
        { id: this.statusId, pollId: this.poll.id, choices: this.choiceIndices }
      ).then(poll => {
        this.loading = false
      })
    }
  }
}
