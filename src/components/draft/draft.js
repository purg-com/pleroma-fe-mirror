import PostStatusForm from 'src/components/post_status_form/post_status_form.vue'
import EditStatusForm from 'src/components/edit_status_form/edit_status_form.vue'
import ConfirmModal from 'src/components/confirm_modal/confirm_modal.vue'
import StatusContent from 'src/components/status_content/status_content.vue'
import Gallery from 'src/components/gallery/gallery.vue'
import { cloneDeep } from 'lodash'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPollH
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faPollH
)

const Draft = {
  components: {
    PostStatusForm,
    EditStatusForm,
    ConfirmModal,
    StatusContent,
    Gallery
  },
  props: {
    draft: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      referenceDraft: cloneDeep(this.draft),
      editing: false,
      showingConfirmDialog: false
    }
  },
  computed: {
    relAttrs () {
      if (this.draft.type === 'edit') {
        return { statusId: this.draft.refId }
      } else if (this.draft.type === 'reply') {
        return { replyTo: this.draft.refId }
      } else {
        return {}
      }
    },
    safeToSave () {
      return this.draft.status ||
        this.draft.files?.length ||
        this.draft.hasPoll
    },
    postStatusFormProps () {
      return {
        draftId: this.draft.id,
        ...this.relAttrs
      }
    },
    refStatus () {
      return this.draft.refId ? this.$store.state.statuses.allStatusesObject[this.draft.refId] : undefined
    },
    localCollapseSubjectDefault () {
      return this.$store.getters.mergedConfig.collapseMessageWithSubject
    },
    nsfwClickthrough () {
      if (!this.draft.nsfw) {
        return false
      }
      if (this.draft.summary && this.localCollapseSubjectDefault) {
        return false
      }
      return true
    }
  },
  watch: {
    editing (newVal) {
      if (newVal) return
      if (this.safeToSave) {
        this.$store.dispatch('addOrSaveDraft', { draft: this.draft })
      } else {
        this.$store.dispatch('addOrSaveDraft', { draft: this.referenceDraft })
      }
    }
  },
  methods: {
    toggleEditing () {
      this.editing = !this.editing
    },
    abandon () {
      this.showingConfirmDialog = true
    },
    doAbandon () {
      this.$store.dispatch('abandonDraft', { id: this.draft.id })
        .then(() => {
          this.hideConfirmDialog()
        })
    },
    hideConfirmDialog () {
      this.showingConfirmDialog = false
    }
  }
}

export default Draft
