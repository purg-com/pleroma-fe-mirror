import Popover from '../popover/popover.vue'
import NavigationEntry from 'src/components/navigation/navigation_entry.vue'
import { mapState } from 'vuex'
import { ListsMenuContent } from '../lists_menu/lists_menu_content.vue'
import { BookmarkFoldersMenuContent } from '../bookmark_folders_menu/bookmark_folders_menu_content.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { TIMELINES } from 'src/components/navigation/navigation.js'
import { filterNavigation } from 'src/components/navigation/filter.js'
import {
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'

library.add(faChevronDown)

// Route -> i18n key mapping, exported and not in the computed
// because nav panel benefits from the same information.
export const timelineNames = (supportsBookmarkFolders) => {
  return {
    friends: 'nav.home_timeline',
    bookmarks: supportsBookmarkFolders ? 'nav.all_bookmarks' : 'nav.bookmarks',
    dms: 'nav.dms',
    'public-timeline': 'nav.public_tl',
    'public-external-timeline': 'nav.twkn',
    quotes: 'nav.quotes'
  }
}

const TimelineMenu = {
  components: {
    Popover,
    NavigationEntry,
    ListsMenuContent,
    BookmarkFoldersMenuContent
  },
  data () {
    return {
      isOpen: false
    }
  },
  created () {
    if (timelineNames(this.bookmarkFolders)[this.$route.name]) {
      this.$store.dispatch('setLastTimeline', this.$route.name)
    }
  },
  computed: {
    useListsMenu () {
      const route = this.$route.name
      return route === 'lists-timeline'
    },
    useBookmarkFoldersMenu () {
      const route = this.$route.name
      return this.bookmarkFolders && (route === 'bookmark-folder' || route === 'bookmarks')
    },
    ...mapState({
      currentUser: state => state.users.currentUser,
      privateMode: state => state.instance.private,
      federating: state => state.instance.federating,
      bookmarkFolders: state => state.instance.pleromaBookmarkFoldersAvailable
    }),
    timelinesList () {
      return filterNavigation(
        Object.entries(TIMELINES).map(([k, v]) => ({ ...v, name: k })),
        {
          hasChats: this.pleromaChatMessagesAvailable,
          isFederating: this.federating,
          isPrivate: this.privateMode,
          currentUser: this.currentUser,
          supportsBookmarkFolders: this.bookmarkFolders
        }
      )
    }
  },
  methods: {
    openMenu () {
      // $nextTick is too fast, animation won't play back but
      // instead starts in fully open position. Low values
      // like 1-5 work on fast machines but not on mobile, 25
      // seems like a good compromise that plays without significant
      // added lag.
      setTimeout(() => {
        this.isOpen = true
      }, 25)
    },
    blockOpen (event) {
      // For the blank area inside the button element.
      // Just setting @click.stop="" makes unintuitive behavior when
      // menu is open and clicking on the blank area doesn't close it.
      if (!this.isOpen) {
        event.stopPropagation()
      }
    },
    timelineName () {
      const route = this.$route.name
      if (route === 'tag-timeline') {
        return '#' + this.$route.params.tag
      }
      if (route === 'lists-timeline') {
        return this.$store.getters.findListTitle(this.$route.params.id)
      }
      if (route === 'bookmark-folder') {
        return this.$store.getters.findBookmarkFolderName(this.$route.params.id)
      }
      const i18nkey = timelineNames(this.bookmarkFolders)[this.$route.name]
      return i18nkey ? this.$t(i18nkey) : route
    }
  }
}

export default TimelineMenu
