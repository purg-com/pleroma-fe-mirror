import { mapState, mapGetters } from 'vuex'
import { mapState as mapPiniaState } from 'pinia'
import Popover from '../popover/popover.vue'
import Attachment from '../attachment/attachment.vue'
import UserAvatar from '../user_avatar/user_avatar.vue'
import Gallery from '../gallery/gallery.vue'
import LinkPreview from '../link-preview/link-preview.vue'
import StatusContent from '../status_content/status_content.vue'
import ChatMessageDate from '../chat_message_date/chat_message_date.vue'
import { defineAsyncComponent } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTimes,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons'
import { useInterfaceStore } from 'src/stores/interface'

library.add(
  faTimes,
  faEllipsisH
)

const ChatMessage = {
  name: 'ChatMessage',
  props: [
    'author',
    'edited',
    'noHeading',
    'chatViewItem',
    'hoveredMessageChain'
  ],
  emits: ['hover'],
  components: {
    Popover,
    Attachment,
    StatusContent,
    UserAvatar,
    Gallery,
    LinkPreview,
    ChatMessageDate,
    UserPopover: defineAsyncComponent(() => import('../user_popover/user_popover.vue'))
  },
  computed: {
    // Returns HH:MM (hours and minutes) in local time.
    createdAt () {
      const time = this.chatViewItem.data.created_at
      return time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
    },
    isCurrentUser () {
      return this.message.account_id === this.currentUser.id
    },
    message () {
      return this.chatViewItem.data
    },
    isMessage () {
      return this.chatViewItem.type === 'message'
    },
    messageForStatusContent () {
      return {
        summary: '',
        emojis: this.message.emojis,
        raw_html: this.message.content || '',
        text: this.message.content || '',
        attachments: this.message.attachments
      }
    },
    hasAttachment () {
      return this.message.attachments.length > 0
    },
    ...mapPiniaState(useInterfaceStore, {
      betterShadow: store => store.browserSupport.cssFilter
    }),
    ...mapState({
      currentUser: state => state.users.currentUser,
      restrictedNicknames: state => state.instance.restrictedNicknames
    }),
    popoverMarginStyle () {
      if (this.isCurrentUser) {
        return {}
      } else {
        return { left: 50 }
      }
    },
    ...mapGetters(['mergedConfig', 'findUser'])
  },
  data () {
    return {
      hovered: false,
      menuOpened: false
    }
  },
  methods: {
    onHover (bool) {
      this.$emit('hover', { isHovered: bool, messageChainId: this.chatViewItem.messageChainId })
    },
    async deleteMessage () {
      const confirmed = window.confirm(this.$t('chats.delete_confirm'))
      if (confirmed) {
        await this.$store.dispatch('deleteChatMessage', {
          messageId: this.chatViewItem.data.id,
          chatId: this.chatViewItem.data.chat_id
        })
      }
      this.hovered = false
      this.menuOpened = false
    }
  }
}

export default ChatMessage
