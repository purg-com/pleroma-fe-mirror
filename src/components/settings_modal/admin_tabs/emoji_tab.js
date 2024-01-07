import { clone } from 'lodash'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import StringSetting from '../helpers/string_setting.vue'
import Checkbox from 'components/checkbox/checkbox.vue'
import StillImage from 'components/still-image/still-image.vue'
import Select from 'components/select/select.vue'
import Popover from 'components/popover/popover.vue'
import ConfirmModal from 'components/confirm_modal/confirm_modal.vue'
import ModifiedIndicator from '../helpers/modified_indicator.vue'

const newEmojiUploadBase = { shortcode: '', file: '', upload: [] }

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
      knownLocalPacks: { },
      knownRemotePacks: { },
      editedParts: { },
      editedMetadata: { },
      packName: '',
      newPackName: '',
      deleteModalVisible: false,
      newEmojiUpload: clone(newEmojiUploadBase),
      remotePackInstance: '',
      remotePackDownloadAs: ''
    }
  },

  computed: {
    pack () {
      return this.packName !== '' ? this.knownPacks[this.packName] : undefined
    },
    packMeta () {
      if (this.editedMetadata[this.packName] === undefined) {
        this.editedMetadata[this.packName] = clone(this.pack.pack)
      }

      return this.editedMetadata[this.packName]
    },
    knownPacks () {
      // Copy the object itself but not the children, so they are still passed by reference and modified
      const result = clone(this.knownLocalPacks)
      for (const instName in this.knownRemotePacks) {
        for (const instPack in this.knownRemotePacks[instName]) {
          result[`${instPack}@${instName}`] = this.knownRemotePacks[instName][instPack]
        }
      }

      return result
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
      if (this.pack.remote !== undefined) {
        // Remote pack
        return `${this.pack.remote.instance}/emoji/${encodeURIComponent(this.pack.remote.baseName)}/${name}`
      } else {
        return `${this.$store.state.instance.server}/emoji/${encodeURIComponent(this.packName)}/${name}`
      }
    },

    uploadEmoji () {
      this.$refs.addEmojiPopover.hidePopover()

      this.$store.state.api.backendInteractor.addNewEmojiFile({
        packName: this.packName,
        file: this.newEmojiUpload.upload[0],
        shortcode: this.newEmojiUpload.shortcode,
        filename: this.newEmojiUpload.file
      }).then(resp => resp.json()).then(resp => {
        if (resp.error !== undefined) {
          this.displayError(resp.error)
          return
        }

        this.pack.files = resp
        this.sortPackFiles(this.packName)

        this.newEmojiUpload = clone(newEmojiUploadBase)
      })
    },

    createEmojiPack () {
      this.$store.state.api.backendInteractor.createEmojiPack(
        { name: this.newPackName }
      ).then(resp => resp.json()).then(resp => {
        if (resp === 'ok') {
          return this.refreshPackList()
        } else {
          this.displayError(resp.error)
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
          this.displayError(resp.error)
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
        if (resp.error !== undefined) {
          this.displayError(resp.error)
          return
        }

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
          shortcode, file: this.pack.files[shortcode]
        }
      }
    },
    deleteEmoji (shortcode) {
      this.editedParts[this.packName][shortcode].deleteModalVisible = false

      this.$store.state.api.backendInteractor.deleteEmojiFile(
        { packName: this.packName, shortcode }
      ).then(resp => resp.json()).then(resp => {
        if (resp.error !== undefined) {
          this.displayError(resp.error)
          return
        }

        this.pack.files = resp
        delete this.editedParts[this.packName][shortcode]

        this.sortPackFiles(this.packName)
      })
    },
    saveEditedEmoji (shortcode) {
      const edited = this.editedParts[this.packName][shortcode]

      if (edited.shortcode === shortcode && edited.file === this.pack.files[shortcode]) {
        delete this.editedParts[this.packName][shortcode]
        return
      }

      this.$store.state.api.backendInteractor.updateEmojiFile(
        { packName: this.packName, shortcode, newShortcode: edited.shortcode, newFilename: edited.file, force: false }
      ).then(resp => {
        if (resp.error !== undefined) {
          this.displayError(resp.error)
          return Promise.reject(resp.error)
        }

        return resp.json()
      }).then(resp => {
        this.pack.files = resp
        delete this.editedParts[this.packName][shortcode]

        this.sortPackFiles(this.packName)
      })
    },
    refreshPackList () {
      return this.$store.state.api.backendInteractor.listEmojiPacks()
        .then(data => data.json())
        .then(packData => {
          if (packData.error !== undefined) {
            this.displayError(packData.error)
            return
          }

          this.knownLocalPacks = packData.packs
          for (const name of Object.keys(this.knownLocalPacks)) {
            this.sortPackFiles(name)
          }
        })
    },
    listRemotePacks () {
      this.$store.state.api.backendInteractor.listRemoteEmojiPacks({ instance: this.remotePackInstance })
        .then(data => data.json())
        .then(packData => {
          if (packData.error !== undefined) {
            this.displayError(packData.error)
            return
          }

          let inst = this.remotePackInstance
          if (!inst.startsWith('http')) { inst = 'https://' + inst }
          const instUrl = new URL(inst)
          inst = instUrl.host

          for (const packName in packData.packs) {
            packData.packs[packName].remote = {
              baseName: packName,
              instance: instUrl.origin
            }
          }

          this.knownRemotePacks[inst] = packData.packs

          this.$refs.remotePackPopover.hidePopover()
        })
    },
    downloadRemotePack () {
      if (this.remotePackDownloadAs.trim() === '') {
        this.remotePackDownloadAs = this.pack.remote.baseName
      }

      this.$store.state.api.backendInteractor.downloadRemoteEmojiPack({
        instance: this.pack.remote.instance, packName: this.pack.remote.baseName, as: this.remotePackDownloadAs
      })
        .then(data => data.json())
        .then(resp => {
          if (resp === 'ok') {
            this.$refs.dlPackPopover.hidePopover()

            return this.refreshPackList()
          } else {
            this.displayError(resp.error)
            return Promise.reject(resp)
          }
        }).then(done => {
          this.packName = this.remotePackDownloadAs
          this.remotePackDownloadAs = ''
        })
    },
    displayError (msg) {
      this.$store.dispatch('pushGlobalNotice', {
        messageKey: 'admin_dash.emoji.error',
        messageArgs: [msg],
        level: 'error'
      })
    },
    sortPackFiles (nameOfPack) {
      // Sort by key
      const sorted = Object.keys(this.knownPacks[nameOfPack].files).sort().reduce((acc, key) => {
        if (key.length === 0) return acc
        acc[key] = this.knownPacks[nameOfPack].files[key]
        return acc
      }, {})
      this.knownPacks[nameOfPack].files = sorted
    }
  },

  mounted () {
    this.refreshPackList()
  }
}

export default EmojiTab
