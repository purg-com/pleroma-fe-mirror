import StatusBookmarkFolderMenu from 'src/components/status_bookmark_folder_menu/status_bookmark_folder_menu.vue'
import Popover from 'src/components/popover/popover.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus,
  faMinus,
  faCheck,
  faTimes,
  faWrench,

  faReply,
  faRetweet,
  faStar,
  faSmileBeam,

  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import {
  faStar as faStarRegular
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faPlus,
  faMinus,
  faCheck,
  faTimes,
  faWrench,

  faReply,
  faRetweet,
  faStar,
  faStarRegular,
  faSmileBeam,

  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faHistory
)

export default {
  props: [
    'button',
    'extra',
    'status',
    'funcArg',
    'animationState',
    'getClass',
    'getComponent',
    'doAction',
    'close'
  ],
  components: {
    StatusBookmarkFolderMenu,
    Popover
  },
  computed: {
    buttonClass () {
      if (!this.extra) console.log(this.button.name)
      return [
        this.button.name + '-button',
        {
          'main-button': this.extra,
          'button-unstyled': !this.extra,
          '-extra': this.extra,
          '-quick': !this.extra,
          '-active': this.button.active?.(this.funcArg),
          disabled: this.button.interactive ? !this.button.interactive(this.funcArg) : false
        }
      ]
    }
  }
}
