import { clone } from 'lodash'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import StringSetting from '../helpers/string_setting.vue'
import Checkbox from 'components/checkbox/checkbox.vue'
import StillImage from 'components/still-image/still-image.vue'
import Select from 'components/select/select.vue'
import Popover from 'components/popover/popover.vue'
import ConfirmModal from 'components/confirm_modal/confirm_modal.vue'
import ModifiedIndicator from '../helpers/modified_indicator.vue'

const EmojiTab = {
  components: {
    TabSwitcher,
    StringSetting,
    Checkbox,
    StillImage,
    Select,
    Popover,
    ConfirmModal,
    ModifiedIndicator
  },

  data () {
    return {
      knownPacks: { },
      editedParts: { },
      editedMetadata: { },
      packName: '',
      newPackName: '',
      deleteModalVisible: false
    }
  },

  computed: {
    pack () {
      return this.packName !== '' ? this.knownPacks[this.packName] : undefined
    },
    packMeta () {
      if (this.editedMetadata[this.packName] === undefined) {
        this.editedMetadata[this.packName] = clone(this.knownPacks[this.packName].pack)
      }

      return this.editedMetadata[this.packName]
    }
  },

  methods: {
    reloadEmoji () {
      this.$store.state.api.backendInteractor.reloadEmoji()
    },
    importFromFS () {
      this.$store.state.api.backendInteractor.importEmojiFromFS()
    },
    emojiAddr (name) {
      return `${this.$store.state.instance.server}/emoji/${encodeURIComponent(this.packName)}/${name}`
    },

    createEmojiPack () {
      this.$store.state.api.backendInteractor.createEmojiPack(
        { name: this.newPackName }
      ).then(resp => resp.json()).then(resp => {
        if (resp === 'ok') {
          return this.refreshPackList()
        } else {
          return Promise.reject(resp)
        }
      }).then(done => {
        this.$refs.createPackPopover.hidePopover()

        this.packName = this.newPackName
        this.newPackName = ''
      })
    },
    deleteEmojiPack () {
      this.$store.state.api.backendInteractor.deleteEmojiPack(
        { name: this.packName }
      ).then(resp => resp.json()).then(resp => {
        if (resp === 'ok') {
          return this.refreshPackList()
        } else {
          return Promise.reject(resp)
        }
      }).then(done => {
        delete this.editedMetadata[this.packName]
        delete this.editedParts[this.packName]

        this.deleteModalVisible = false
        this.packName = ''
      })
    },

    metaEdited (prop) {
      return this.pack && this.packMeta[prop] !== this.pack.pack[prop]
    },
    savePackMetadata () {
      this.$store.state.api.backendInteractor.saveEmojiPackMetadata({ name: this.packName, newData: this.packMeta }).then(
        resp => resp.json()
      ).then(resp => {
        // Update actual pack data
        this.pack.pack = resp
        // Delete edited pack data, should auto-update itself
        delete this.editedMetadata[this.packName]
      })
    },

    editEmoji (shortcode) {
      if (this.editedParts[this.packName] === undefined) { this.editedParts[this.packName] = {} }

      if (this.editedParts[this.packName][shortcode] === undefined) {
        this.editedParts[this.packName][shortcode] = {
          shortcode, file: this.knownPacks[this.packName].files[shortcode]
        }
      }
    },
    saveEditedEmoji (shortcode) {
      const edited = this.editedParts[this.packName][shortcode]

      this.$store.state.api.backendInteractor.updateEmojiFile(
        { packName: this.packName, shortcode, newShortcode: edited.shortcode, newFilename: edited.file, force: false }
      ).then(resp =>
        resp.ok ? resp.json() : resp.text().then(respText => Promise.reject(respText))
      ).then(resp => {
        this.knownPacks[this.packName].files = resp
        delete this.editedParts[this.packName][shortcode]
      })
    },
    refreshPackList () {
      return this.$store.state.api.backendInteractor.listEmojiPacks()
        .then(data => data.json())
        .then(packData => {
          this.knownPacks = packData.packs
        })
    }
  },

  mounted () {
    this.refreshPackList()
  }
}

export default EmojiTab
