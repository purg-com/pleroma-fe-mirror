import ActionButton from './action_button.vue'
import Popover from 'src/components/popover/popover.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUser,
  faGlobe,
  faFolderTree
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUser,
  faGlobe,
  faFolderTree
)

export default {
  components: {
    ActionButton,
    Popover
  },
  props: ['button']
}
