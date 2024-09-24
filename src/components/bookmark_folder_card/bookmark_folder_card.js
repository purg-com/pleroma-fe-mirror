import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEllipsisH
)

const BookmarkFolderCard = {
  props: [
    'folder'
  ],
  computed: {
    firstLetter () {
      return this.folder.name[0]
    }
  }
}

export default BookmarkFolderCard
