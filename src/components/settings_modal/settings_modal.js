import Modal from 'src/components/modal/modal.vue'
import PanelLoading from 'src/components/panel_loading/panel_loading.vue'
import AsyncComponentError from 'src/components/async_component_error/async_component_error.vue'
import getResettableAsyncComponent from 'src/services/resettable_async_component.js'
import Popover from '../popover/popover.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ConfirmModal from 'src/components/confirm_modal/confirm_modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { cloneDeep, isEqual } from 'lodash'
import {
  newImporter,
  newExporter
} from 'src/services/export_import/export_import.js'
import {
  faTimes,
  faFileUpload,
  faFileDownload,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import {
  faWindowMinimize
} from '@fortawesome/free-regular-svg-icons'

const PLEROMAFE_SETTINGS_MAJOR_VERSION = 1
const PLEROMAFE_SETTINGS_MINOR_VERSION = 0

library.add(
  faTimes,
  faWindowMinimize,
  faFileUpload,
  faFileDownload,
  faChevronDown
)

const SettingsModal = {
  data () {
    return {
      dataImporter: newImporter({
        validator: this.importValidator,
        onImport: this.onImport,
        onImportFailure: this.onImportFailure
      }),
      dataThemeExporter: newExporter({
        filename: 'pleromafe_settings.full',
        getExportedObject: () => this.generateExport(true)
      }),
      dataExporter: newExporter({
        filename: 'pleromafe_settings',
        getExportedObject: () => this.generateExport()
      })
    }
  },
  components: {
    Modal,
    Popover,
    Checkbox,
    ConfirmModal,
    SettingsModalUserContent: getResettableAsyncComponent(
      () => import('./settings_modal_user_content.vue'),
      {
        loadingComponent: PanelLoading,
        errorComponent: AsyncComponentError,
        delay: 0
      }
    ),
    SettingsModalAdminContent: getResettableAsyncComponent(
      () => import('./settings_modal_admin_content.vue'),
      {
        loadingComponent: PanelLoading,
        errorComponent: AsyncComponentError,
        delay: 0
      }
    )
  },
  methods: {
    closeModal () {
      this.$store.dispatch('closeSettingsModal')
    },
    peekModal () {
      this.$store.dispatch('togglePeekSettingsModal')
    },
    importValidator (data) {
      if (!Array.isArray(data._pleroma_settings_version)) {
        return {
          messageKey: 'settings.file_import_export.invalid_file'
        }
      }

      const [major, minor] = data._pleroma_settings_version

      if (major > PLEROMAFE_SETTINGS_MAJOR_VERSION) {
        return {
          messageKey: 'settings.file_export_import.errors.file_too_new',
          messageArgs: {
            fileMajor: major,
            feMajor: PLEROMAFE_SETTINGS_MAJOR_VERSION
          }
        }
      }

      if (major < PLEROMAFE_SETTINGS_MAJOR_VERSION) {
        return {
          messageKey: 'settings.file_export_import.errors.file_too_old',
          messageArgs: {
            fileMajor: major,
            feMajor: PLEROMAFE_SETTINGS_MAJOR_VERSION
          }
        }
      }

      if (minor > PLEROMAFE_SETTINGS_MINOR_VERSION) {
        this.$store.dispatch('pushGlobalNotice', {
          level: 'warning',
          messageKey: 'settings.file_export_import.errors.file_slightly_new'
        })
      }

      return true
    },
    onImportFailure (result) {
      if (result.error) {
        this.$store.dispatch('pushGlobalNotice', { messageKey: 'settings.invalid_settings_imported', level: 'error' })
      } else {
        this.$store.dispatch('pushGlobalNotice', { ...result.validationResult, level: 'error' })
      }
    },
    onImport (data) {
      if (data) { this.$store.dispatch('loadSettings', data) }
    },
    restore () {
      this.dataImporter.importData()
    },
    backup () {
      this.dataExporter.exportData()
    },
    backupWithTheme () {
      this.dataThemeExporter.exportData()
    },
    generateExport (theme = false) {
      const { config } = this.$store.state
      let sample = config
      if (!theme) {
        const ignoreList = new Set([
          'customTheme',
          'customThemeSource',
          'colors'
        ])
        sample = Object.fromEntries(
          Object
            .entries(sample)
            .filter(([key]) => !ignoreList.has(key))
        )
      }
      const clone = cloneDeep(sample)
      clone._pleroma_settings_version = [
        PLEROMAFE_SETTINGS_MAJOR_VERSION,
        PLEROMAFE_SETTINGS_MINOR_VERSION
      ]
      return clone
    },
    resetAdminDraft () {
      this.$store.commit('resetAdminDraft')
    },
    pushAdminDraft () {
      this.$store.dispatch('pushAdminDraft')
    }
  },
  computed: {
    currentSaveStateNotice () {
      return this.$store.state.interface.settings.currentSaveStateNotice
    },
    modalActivated () {
      return this.$store.state.interface.settingsModalState !== 'hidden'
    },
    modalMode () {
      return this.$store.state.interface.settingsModalMode
    },
    modalOpenedOnceUser () {
      return this.$store.state.interface.settingsModalLoadedUser
    },
    modalOpenedOnceAdmin () {
      return this.$store.state.interface.settingsModalLoadedAdmin
    },
    modalPeeked () {
      return this.$store.state.interface.settingsModalState === 'minimized'
    },
    expertLevel: {
      get () {
        return this.$store.state.config.expertLevel > 0
      },
      set (value) {
        this.$store.dispatch('setOption', { name: 'expertLevel', value: value ? 1 : 0 })
      }
    },
    adminDraftAny () {
      return !isEqual(
        this.$store.state.adminSettings.config,
        this.$store.state.adminSettings.draft
      )
    }
  }
}

export default SettingsModal
