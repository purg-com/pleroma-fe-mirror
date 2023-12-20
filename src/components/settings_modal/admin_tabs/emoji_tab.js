import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import StringSetting from '../helpers/string_setting.vue'
import Checkbox from 'components/checkbox/checkbox.vue'
import StillImage from 'components/still-image/still-image.vue'

const EmojiTab = {
  components: {
    TabSwitcher,
    StringSetting,
    Checkbox,
    StillImage
  },

  data () {
    return {
      knownPacks: { },
      editedParts: { }
    }
  },

  methods: {
    reloadEmoji () {
      this.$store.state.api.backendInteractor.reloadEmoji()
    },
    importFromFS () {
      this.$store.state.api.backendInteractor.importEmojiFromFS()
    },
    emojiAddr (packName, name) {
      return `${this.$store.state.instance.server}/emoji/${encodeURIComponent(packName)}/${name}`
    },
    editEmoji (packName, shortcode) {
      if (this.editedParts[packName] === undefined) { this.editedParts[packName] = {} }

      this.editedParts[packName][shortcode] = {
        shortcode, file: this.knownPacks[packName].files[shortcode]
      }
    },
    saveEditedEmoji (packName, shortcode) {
      const edited = this.editedParts[packName][shortcode]

      this.$store.state.api.backendInteractor.updateEmojiFile(
        { packName, shortcode, newShortcode: edited.shortcode, newFilename: edited.file, force: false }
      ).then(resp =>
        resp.ok ? resp.json() : resp.text().then(respText => Promise.reject(respText))
      ).then(resp => {
        this.knownPacks[packName].files = resp
        delete this.editedParts[packName][shortcode]
      })
    }
  },

  mounted () {
    this.$store.state.api.backendInteractor.listEmojiPacks()
      .then(data => data.json())
      .then(packData => {
        this.knownPacks = packData.packs
        console.log(this.knownPacks)
      })
  }
}

export default EmojiTab
