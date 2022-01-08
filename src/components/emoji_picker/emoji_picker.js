import { defineAsyncComponent } from 'vue'
import Checkbox from '../checkbox/checkbox.vue'
import StillImage from '../still-image/still-image.vue'
import lozad from 'lozad'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBoxOpen,
  faStickyNote,
  faSmileBeam,
  faSmile,
  faUser,
  faPaw,
  faIceCream,
  faBus,
  faBasketballBall,
  faLightbulb,
  faCode,
  faFlag
} from '@fortawesome/free-solid-svg-icons'
import { trim } from 'lodash'

library.add(
  faBoxOpen,
  faStickyNote,
  faSmileBeam,
  faSmile,
  faUser,
  faPaw,
  faIceCream,
  faBus,
  faBasketballBall,
  faLightbulb,
  faCode,
  faFlag
)

const UNICODE_EMOJI_GROUP_ICON = {
  'smileys-and-emotion': 'smile',
  'people-and-body': 'user',
  'animals-and-nature': 'paw',
  'food-and-drink': 'ice-cream',
  'travel-and-places': 'bus',
  'activities': 'basketball-ball',
  'objects': 'lightbulb',
  'symbols': 'code',
  'flags': 'flag'
}

const filterByKeyword = (list, keyword = '') => {
  if (keyword === '') return list

  const keywordLowercase = keyword.toLowerCase()
  const orderedEmojiList = []
  for (const emoji of list) {
    const indexOfKeyword = emoji.displayText.toLowerCase().indexOf(keywordLowercase)
    if (indexOfKeyword > -1) {
      if (!Array.isArray(orderedEmojiList[indexOfKeyword])) {
        orderedEmojiList[indexOfKeyword] = []
      }
      orderedEmojiList[indexOfKeyword].push(emoji)
    }
  }
  return orderedEmojiList.flat()
}

const EmojiPicker = {
  props: {
    enableStickerPicker: {
      required: false,
      type: Boolean,
      default: false
    },
    showing: {
      required: true,
      type: Boolean
    }
  },
  data () {
    return {
      keyword: '',
      activeGroup: 'custom',
      showingStickers: false,
      groupsScrolledClass: 'scrolled-top',
      keepOpen: false,
      customEmojiTimeout: null,
      // Lazy-load only after the first time `showing` becomes true.
      contentLoaded: false
    }
  },
  components: {
    StickerPicker: defineAsyncComponent(() => import('../sticker_picker/sticker_picker.vue')),
    Checkbox,
    StillImage
  },
  methods: {
    onStickerUploaded (e) {
      this.$emit('sticker-uploaded', e)
    },
    onStickerUploadFailed (e) {
      this.$emit('sticker-upload-failed', e)
    },
    onEmoji (emoji) {
      const value = emoji.imageUrl ? `:${emoji.displayText}:` : emoji.replacement
      this.$emit('emoji', { insertion: value, keepOpen: this.keepOpen })
    },
    onScroll (e) {
      const target = (e && e.target) || this.$refs['emoji-groups']
      this.updateScrolledClass(target)
      this.scrolledGroup(target)
    },
    scrolledGroup (target) {
      const top = target.scrollTop + 5
      this.$nextTick(() => {
        this.allEmojiGroups.forEach(group => {
          const ref = this.$refs['group-' + group.id]
          if (ref[0].offsetTop <= top) {
            this.activeGroup = group.id
          }
        })
        this.scrollHeader()
      })
    },
    scrollHeader () {
      // Scroll the active tab's header into view
      const headerRef = this.$refs['group-header-' + this.activeGroup][0]
      const left = headerRef.offsetLeft
      const right = left + headerRef.offsetWidth
      const headerCont = this.$refs.header
      const currentScroll = headerCont.scrollLeft
      const currentScrollRight = currentScroll + headerCont.clientWidth
      const setScroll = s => { headerCont.scrollLeft = s }

      const margin = 7 // .emoji-tabs-item: padding
      if (left - margin < currentScroll) {
        setScroll(left - margin)
      } else if (right + margin > currentScrollRight) {
        setScroll(right + margin - headerCont.clientWidth)
      }
    },
    highlight (key) {
      const ref = this.$refs['group-' + key]
      const top = ref.offsetTop
      this.setShowStickers(false)
      this.activeGroup = key
      this.$nextTick(() => {
        this.$refs['emoji-groups'].scrollTop = top + 1
      })
    },
    updateScrolledClass (target) {
      if (target.scrollTop <= 5) {
        this.groupsScrolledClass = 'scrolled-top'
      } else if (target.scrollTop >= target.scrollTopMax - 5) {
        this.groupsScrolledClass = 'scrolled-bottom'
      } else {
        this.groupsScrolledClass = 'scrolled-middle'
      }
    },
    toggleStickers () {
      this.showingStickers = !this.showingStickers
    },
    setShowStickers (value) {
      this.showingStickers = value
    },
    filterByKeyword (list, keyword) {
      return filterByKeyword(list, keyword)
    },
    initializeLazyLoad () {
      this.destroyLazyLoad()
      this.$nextTick(() => {
        this.$lozad = lozad('.still-image.emoji-picker-emoji', {
          load: el => {
            const vn = el.__vue__
            if (!vn) {
              return
            }

            vn.loadLazy()
          }
        })
        this.$lozad.observe()
      })
    },
    waitForDomAndInitializeLazyLoad () {
      this.$nextTick(() => this.initializeLazyLoad())
    },
    destroyLazyLoad () {
      if (this.$lozad) {
        if (this.$lozad.observer) {
          this.$lozad.observer.disconnect()
        }
        if (this.$lozad.mutationObserver) {
          this.$lozad.mutationObserver.disconnect()
        }
      }
    },
    onShowing () {
      const oldContentLoaded = this.contentLoaded
      this.contentLoaded = true
      this.waitForDomAndInitializeLazyLoad()
      if (!oldContentLoaded) {
        this.$nextTick(() => {
          if (this.defaultGroup) {
            this.highlight(this.defaultGroup)
          }
        })
      }
    }
  },
  watch: {
    keyword () {
      this.onScroll()
      this.waitForDomAndInitializeLazyLoad()
    },
    allCustomGroups () {
      this.waitForDomAndInitializeLazyLoad()
    },
    showing (val) {
      if (val) {
        this.onShowing()
      }
    }
  },
  mounted () {
    if (this.showing) {
      this.onShowing()
    }
  },
  destroyed () {
    this.destroyLazyLoad()
  },
  computed: {
    activeGroupView () {
      return this.showingStickers ? '' : this.activeGroup
    },
    stickersAvailable () {
      if (this.$store.state.instance.stickers) {
        return this.$store.state.instance.stickers.length > 0
      }
      return 0
    },
    allCustomGroups () {
      return this.$store.getters.groupedCustomEmojis
    },
    defaultGroup () {
      return Object.keys(this.allCustomGroups)[0]
    },
    unicodeEmojiGroups () {
      return this.$store.getters.standardEmojiGroupList.map(group => ({
        id: `standard-${group.id}`,
        text: this.$t(`emoji.unicode_groups.${group.id}`),
        icon: UNICODE_EMOJI_GROUP_ICON[group.id],
        emojis: group.emojis
      }))
    },
    allEmojiGroups () {
      return Object.entries(this.allCustomGroups)
        .map(([_, v]) => v)
        .concat(this.unicodeEmojiGroups)
    },
    filteredEmojiGroups () {
      return this.allEmojiGroups
        .map(group => ({
          ...group,
          emojis: filterByKeyword(group.emojis, this.keyword)
        }))
        .filter(group => group.emojis.length > 0)
    },
    stickerPickerEnabled () {
      return (this.$store.state.instance.stickers || []).length !== 0
    }
  }
}

export default EmojiPicker
