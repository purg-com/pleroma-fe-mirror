import unescape from 'lodash/unescape'
import merge from 'lodash/merge'
import ImageCropper from 'src/components/image_cropper/image_cropper.vue'
import ScopeSelector from 'src/components/scope_selector/scope_selector.vue'
import fileSizeFormatService from 'src/components/../services/file_size_format/file_size_format.js'
import ProgressButton from 'src/components/progress_button/progress_button.vue'
import EmojiInput from 'src/components/emoji_input/emoji_input.vue'
import suggestor from 'src/components/emoji_input/suggestor.js'
import Autosuggest from 'src/components/autosuggest/autosuggest.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import InterfaceLanguageSwitcher from 'src/components/interface_language_switcher/interface_language_switcher.vue'
import Select from 'src/components/select/select.vue'
import BooleanSetting from '../helpers/boolean_setting.vue'
import SharedComputedObject from '../helpers/shared_computed_object.js'
import localeService from 'src/services/locale/locale.service.js'
import { propsToNative } from 'src/services/attributes_helper/attributes_helper.service.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTimes,
  faPlus,
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons'
import { useInterfaceStore } from 'src/stores/interface'

library.add(
  faTimes,
  faPlus,
  faCircleNotch
)

const ProfileTab = {
  data () {
    return {
      newName: this.$store.state.users.currentUser.name_unescaped,
      newBio: unescape(this.$store.state.users.currentUser.description),
      newLocked: this.$store.state.users.currentUser.locked,
      newBirthday: this.$store.state.users.currentUser.birthday,
      showBirthday: this.$store.state.users.currentUser.show_birthday,
      newFields: this.$store.state.users.currentUser.fields.map(field => ({ name: field.name, value: field.value })),
      showRole: this.$store.state.users.currentUser.show_role,
      role: this.$store.state.users.currentUser.role,
      bot: this.$store.state.users.currentUser.bot,
      actorType: this.$store.state.users.currentUser.actor_type,
      pickAvatarBtnVisible: true,
      bannerUploading: false,
      backgroundUploading: false,
      banner: null,
      bannerPreview: null,
      background: null,
      backgroundPreview: null,
      emailLanguage: this.$store.state.users.currentUser.language || ['']
    }
  },
  components: {
    ScopeSelector,
    ImageCropper,
    EmojiInput,
    Autosuggest,
    ProgressButton,
    Checkbox,
    BooleanSetting,
    InterfaceLanguageSwitcher,
    Select
  },
  computed: {
    user () {
      return this.$store.state.users.currentUser
    },
    ...SharedComputedObject(),
    emojiUserSuggestor () {
      return suggestor({
        emoji: [
          ...this.$store.getters.standardEmojiList,
          ...this.$store.state.instance.customEmoji
        ],
        store: this.$store
      })
    },
    emojiSuggestor () {
      return suggestor({
        emoji: [
          ...this.$store.getters.standardEmojiList,
          ...this.$store.state.instance.customEmoji
        ]
      })
    },
    userSuggestor () {
      return suggestor({ store: this.$store })
    },
    fieldsLimits () {
      return this.$store.state.instance.fieldsLimits
    },
    maxFields () {
      return this.fieldsLimits ? this.fieldsLimits.maxFields : 0
    },
    defaultAvatar () {
      return this.$store.state.instance.server + this.$store.state.instance.defaultAvatar
    },
    defaultBanner () {
      return this.$store.state.instance.server + this.$store.state.instance.defaultBanner
    },
    isDefaultAvatar () {
      const baseAvatar = this.$store.state.instance.defaultAvatar
      return !(this.$store.state.users.currentUser.profile_image_url) ||
      this.$store.state.users.currentUser.profile_image_url.includes(baseAvatar)
    },
    isDefaultBanner () {
      const baseBanner = this.$store.state.instance.defaultBanner
      return !(this.$store.state.users.currentUser.cover_photo) ||
      this.$store.state.users.currentUser.cover_photo.includes(baseBanner)
    },
    isDefaultBackground () {
      return !(this.$store.state.users.currentUser.background_image)
    },
    avatarImgSrc () {
      const src = this.$store.state.users.currentUser.profile_image_url_original
      return (!src) ? this.defaultAvatar : src
    },
    bannerImgSrc () {
      const src = this.$store.state.users.currentUser.cover_photo
      return (!src) ? this.defaultBanner : src
    },
    groupActorAvailable () {
      return this.$store.state.instance.groupActorAvailable
    },
    availableActorTypes () {
      return this.groupActorAvailable ? ['Person', 'Service', 'Group'] : ['Person', 'Service']
    }
  },
  methods: {
    updateProfile () {
      const params = {
        note: this.newBio,
        locked: this.newLocked,

        // Backend notation.
        display_name: this.newName,
        fields_attributes: this.newFields.filter(el => el != null),
        actor_type: this.actorType,
        show_role: this.showRole,
        birthday: this.newBirthday || '',
        show_birthday: this.showBirthday
      }

      if (this.emailLanguage) {
        params.language = localeService.internalToBackendLocaleMulti(this.emailLanguage)
      }

      this.$store.state.api.backendInteractor
        .updateProfile({ params })
        .then((user) => {
          this.newFields.splice(user.fields.length)
          merge(this.newFields, user.fields)
          this.$store.commit('addNewUsers', [user])
          this.$store.commit('setCurrentUser', user)
        })
    },
    changeVis (visibility) {
      this.newDefaultScope = visibility
    },
    addField () {
      if (this.newFields.length < this.maxFields) {
        this.newFields.push({ name: '', value: '' })
        return true
      }
      return false
    },
    deleteField (index) {
      this.newFields.splice(index, 1)
    },
    uploadFile (slot, e) {
      const file = e.target.files[0]
      if (!file) { return }
      if (file.size > this.$store.state.instance[slot + 'limit']) {
        const filesize = fileSizeFormatService.fileSizeFormat(file.size)
        const allowedsize = fileSizeFormatService.fileSizeFormat(this.$store.state.instance[slot + 'limit'])
        useInterfaceStore().pushGlobalNotice({
          messageKey: 'upload.error.message',
          messageArgs: [
            this.$t('upload.error.file_too_big', {
              filesize: filesize.num,
              filesizeunit: filesize.unit,
              allowedsize: allowedsize.num,
              allowedsizeunit: allowedsize.unit
            })
          ],
          level: 'error'
        })
        return
      }

      const reader = new FileReader()
      reader.onload = ({ target }) => {
        const img = target.result
        this[slot + 'Preview'] = img
        this[slot] = file
      }
      reader.readAsDataURL(file)
    },
    resetAvatar () {
      const confirmed = window.confirm(this.$t('settings.reset_avatar_confirm'))
      if (confirmed) {
        this.submitAvatar(undefined, '')
      }
    },
    resetBanner () {
      const confirmed = window.confirm(this.$t('settings.reset_banner_confirm'))
      if (confirmed) {
        this.submitBanner('')
      }
    },
    resetBackground () {
      const confirmed = window.confirm(this.$t('settings.reset_background_confirm'))
      if (confirmed) {
        this.submitBackground('')
      }
    },
    submitAvatar (canvas, file) {
      const that = this
      return new Promise((resolve, reject) => {
        function updateAvatar (avatar, avatarName) {
          that.$store.state.api.backendInteractor.updateProfileImages({ avatar, avatarName })
            .then((user) => {
              that.$store.commit('addNewUsers', [user])
              that.$store.commit('setCurrentUser', user)
              resolve()
            })
            .catch((error) => {
              that.displayUploadError(error)
              reject(error)
            })
        }

        if (canvas) {
          canvas.toBlob((data) => updateAvatar(data, file.name), file.type)
        } else {
          updateAvatar(file, file.name)
        }
      })
    },
    submitBanner (banner) {
      if (!this.bannerPreview && banner !== '') { return }

      this.bannerUploading = true
      this.$store.state.api.backendInteractor.updateProfileImages({ banner })
        .then((user) => {
          this.$store.commit('addNewUsers', [user])
          this.$store.commit('setCurrentUser', user)
          this.bannerPreview = null
        })
        .catch(this.displayUploadError)
        .finally(() => { this.bannerUploading = false })
    },
    submitBackground (background) {
      if (!this.backgroundPreview && background !== '') { return }

      this.backgroundUploading = true
      this.$store.state.api.backendInteractor.updateProfileImages({ background })
        .then((data) => {
          this.$store.commit('addNewUsers', [data])
          this.$store.commit('setCurrentUser', data)
          this.backgroundPreview = null
        })
        .catch(this.displayUploadError)
        .finally(() => { this.backgroundUploading = false })
    },
    displayUploadError (error) {
      useInterfaceStore().pushGlobalNotice({
        messageKey: 'upload.error.message',
        messageArgs: [error.message],
        level: 'error'
      })
    },
    propsToNative (props) {
      return propsToNative(props)
    }
  }
}

export default ProfileTab
