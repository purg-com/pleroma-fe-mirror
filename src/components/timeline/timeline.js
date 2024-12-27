import Status from '../status/status.vue'
import { mapState } from 'vuex'
import timelineFetcher from '../../services/timeline_fetcher/timeline_fetcher.service.js'
import Conversation from '../conversation/conversation.vue'
import TimelineMenu from '../timeline_menu/timeline_menu.vue'
import QuickFilterSettings from '../quick_filter_settings/quick_filter_settings.vue'
import QuickViewSettings from '../quick_view_settings/quick_view_settings.vue'
import { debounce, throttle, keyBy } from 'lodash'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch, faCirclePlus, faCog, faMinus, faArrowUp, faCheck } from '@fortawesome/free-solid-svg-icons'

library.add(
  faCircleNotch,
  faCog,
  faMinus,
  faArrowUp,
  faCirclePlus,
  faCheck
)

const Timeline = {
  props: [
    'timeline',
    'timelineName',
    'title',
    'userId',
    'listId',
    'statusId',
    'bookmarkFolderId',
    'tag',
    'embedded',
    'count',
    'pinnedStatusIds',
    'inProfile',
    'footerSlipgate' // reference to an element where we should put our footer
  ],
  data () {
    return {
      showScrollTop: false,
      paused: false,
      unfocused: false,
      bottomedOut: false,
      virtualScrollIndex: 0,
      blockingClicks: false
    }
  },
  components: {
    Status,
    Conversation,
    TimelineMenu,
    QuickFilterSettings,
    QuickViewSettings
  },
  computed: {
    // scrollParent element. Usually it's window obj,
    // but in case scroll behaviour is overriden it can be anything
    scrollParent () {
      const parentId = 'content'
      const useWindow = false

      if (useWindow) {
        return window
      } else {
        return document.getElementById(parentId)
      }
    },
    filteredVisibleStatuses () {
      return this.timeline.visibleStatuses.filter(status => this.timelineName !== 'user' || (status.id >= this.timeline.minId && status.id <= this.timeline.maxId))
    },
    filteredPinnedStatusIds () {
      return (this.pinnedStatusIds || []).filter(statusId => this.timeline.statusesObject[statusId])
    },
    newStatusCount () {
      return this.timeline.newStatusCount
    },
    showLoadButton () {
      return this.timeline.newStatusCount > 0 || this.timeline.flushMarker !== 0
    },
    loadButtonString () {
      if (this.timeline.flushMarker !== 0) {
        return this.$t('timeline.reload')
      } else {
        return `${this.$t('timeline.show_new')} (${this.newStatusCount})`
      }
    },
    mobileLoadButtonString () {
      if (this.timeline.flushMarker !== 0) {
        return '+'
      } else {
        return this.newStatusCount > 99 ? '∞' : this.newStatusCount
      }
    },
    classes () {
      let rootClasses = !this.embedded ? ['panel', 'panel-default'] : ['-embedded']
      if (this.blockingClicks) rootClasses = rootClasses.concat(['-blocked', '_misclick-prevention'])
      return {
        root: rootClasses,
        header: ['timeline-heading'].concat(!this.embedded ? ['panel-heading', '-sticky'] : ['panel-body']),
        body: ['timeline-body'].concat(!this.embedded ? ['panel-body'] : ['panel-body']),
        footer: ['timeline-footer'].concat(!this.embedded ? ['panel-footer'] : ['panel-body'])
      }
    },
    // id map of statuses which need to be hidden in the main list due to pinning logic
    pinnedStatusIdsObject () {
      return keyBy(this.pinnedStatusIds)
    },
    statusesToDisplay () {
      const amount = this.timeline.visibleStatuses.length
      const statusesPerSide = Math.ceil(Math.max(3, window.innerHeight / 80))
      const nonPinnedIndex = this.virtualScrollIndex - this.filteredPinnedStatusIds.length
      const min = Math.max(0, nonPinnedIndex - statusesPerSide)
      const max = Math.min(amount, nonPinnedIndex + statusesPerSide)
      return this.timeline.visibleStatuses.slice(min, max).map(_ => _.id)
    },
    virtualScrollingEnabled () {
      return this.$store.getters.mergedConfig.virtualScrolling
    },
    ...mapState({
      mobileLayout: state => state.interface.layoutType === 'mobile'
    })
  },
  created () {
    const store = this.$store
    const credentials = store.state.users.currentUser.credentials
    const showImmediately = this.timeline.visibleStatuses.length === 0

    this.scrollParent.addEventListener('scroll', this.handleScroll)

    if (store.state.api.fetchers[this.timelineName]) { return false }

    timelineFetcher.fetchAndUpdate({
      store,
      credentials,
      timeline: this.timelineName,
      showImmediately,
      userId: this.userId,
      listId: this.listId,
      statusId: this.statusId,
      bookmarkFolderId: this.bookmarkFolderId,
      tag: this.tag
    })
  },
  mounted () {
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
      this.unfocused = document.hidden
    }

    this.scrollParent.addEventListener('keydown', this.handleShortKey)
    setTimeout(this.determineVisibleStatuses, 250)
  },
  unmounted () {
    this.scrollParent.removeEventListener('scroll', this.handleScroll)
    this.scrollParent.removeEventListener('keydown', this.handleShortKey)

    if (typeof document.hidden !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange, false)
    }
    this.$store.commit('setLoading', { timeline: this.timelineName, value: false })
  },
  methods: {
    getScrollTop () {
      return this.scrollParent === window ? window.scrollY : this.scrollParent.scrollTop
    },
    getClientHeight () {
      return this.scrollParent === window ? window.innerHeight : this.scrollParent.clientHeight
    },
    getBoundingRect () {
      const containerObj = this.scrollParent === window ? document.body : this.scrollParent
      return containerObj.getBoundingClientRect()
    },
    scrollToTop () {
      this.scrollParent.scrollTo({ top: this.$el.offsetTop })
    },
    stopBlockingClicks: debounce(function () {
      this.blockingClicks = false
    }, 1000),
    blockClicksTemporarily () {
      if (!this.blockingClicks) {
        this.blockingClicks = true
      }
      this.stopBlockingClicks()
    },
    handleShortKey (e) {
      // Ignore when input fields are focused
      if (['textarea', 'input'].includes(e.target.tagName.toLowerCase())) return
      if (e.key === '.') this.showNewStatuses()
    },
    showNewStatuses () {
      if (this.timeline.flushMarker !== 0) {
        this.$store.commit('clearTimeline', { timeline: this.timelineName, excludeUserId: true })
        this.$store.commit('queueFlush', { timeline: this.timelineName, id: 0 })
        if (this.timelineName === 'user') {
          this.$store.dispatch('fetchPinnedStatuses', this.userId)
        }
        this.fetchOlderStatuses()
      } else {
        this.blockClicksTemporarily()
        this.$store.commit('showNewStatuses', { timeline: this.timelineName })
        this.paused = false
      }
      this.scrollParent.scrollTo({ top: 0 })
    },
    fetchOlderStatuses: throttle(function () {
      const store = this.$store
      const credentials = store.state.users.currentUser.credentials
      store.commit('setLoading', { timeline: this.timelineName, value: true })
      timelineFetcher.fetchAndUpdate({
        store,
        credentials,
        timeline: this.timelineName,
        older: true,
        showImmediately: true,
        userId: this.userId,
        listId: this.listId,
        statusId: this.statusId,
        bookmarkFolderId: this.bookmarkFolderId,
        tag: this.tag
      }).then(({ statuses }) => {
        if (statuses && statuses.length === 0) {
          this.bottomedOut = true
        }
      }).finally(() =>
        store.commit('setLoading', { timeline: this.timelineName, value: false })
      )
    }, 1000, this),
    determineVisibleStatuses () {
      const statuses = this.$refs.timeline ? this.$refs.timeline.children : []
      const centerOfScreen = window.scrollY + (window.innerHeight * 0.5)

      if (statuses.length === 0 || !this.virtualScrollingEnabled) {
        return
      }

      // Find the status that is closest to the center of the screen
      let closestStatus = 0
      let closestDistance = Infinity

      for (let i = 0; i < statuses.length; i++) {
        const statusRect = statuses[i].getBoundingClientRect()
        const statusCenter = statusRect.top + (statusRect.height / 2)
        const distance = Math.abs(centerOfScreen - statusCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestStatus = i
        }
      }

      this.virtualScrollIndex = closestStatus
    },
    scrollLoad (e) {
      let fetchStatuses = false

      if (this.timeline.loading === false && this.$el.offsetHeight > 0) {
        if (this.virtualScrollingEnabled) {
          // When virtual scrolling is enabled, fetch new stuff after ~80% of the timeline is viewed
          const updateFactor = 0.80
          const allStatuses = this.$refs.timeline ? this.$refs.timeline.children : []
          const statusCount = allStatuses.length

          fetchStatuses = statusCount > 0 && (this.virtualScrollIndex / statusCount) >= updateFactor
        } else {
          // When virtual scrolling is not in use, refer to the magic number
          const bodyBRect = this.getBoundingRect()
          const height = Math.max(bodyBRect.height, -(bodyBRect.y))

          fetchStatuses = (this.getClientHeight() + this.getScrollTop()) >= (height - 750)
        }

        if (fetchStatuses) {
          this.fetchOlderStatuses()
        }
      }
    },
    handleScroll: throttle(function (e) {
      this.showScrollTop = this.$el.offsetTop < this.getScrollTop()
      this.determineVisibleStatuses()
      this.scrollLoad(e)
    }, 200),
    handleVisibilityChange () {
      this.unfocused = document.hidden
    }
  },
  watch: {
    newStatusCount (count) {
      if (!this.$store.getters.mergedConfig.streaming) {
        return
      }
      if (count > 0) {
        // only 'stream' them when you're scrolled to the top
        const doc = document.documentElement
        const top = (this.getScrollTop() || doc.scrollTop) - (doc.clientTop || 0)
        if (top < 15 &&
            !this.paused &&
            !(this.unfocused && this.$store.getters.mergedConfig.pauseOnUnfocused)
        ) {
          this.showNewStatuses()
        } else {
          this.paused = true
        }
      }
    }
  }
}

export default Timeline
