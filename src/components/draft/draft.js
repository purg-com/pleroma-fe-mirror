import PostStatusForm from 'src/components/post_status_form/post_status_form.vue'
import ConfirmModal from 'src/components/confirm_modal/confirm_modal.vue'

const Draft = {
  components: {
    PostStatusForm,
    ConfirmModal
  },
  props: {
    draft: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
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
    postStatusFormProps () {
      return {
        draftId: this.draft.id,
        ...this.relAttrs
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
      console.debug('abandoning')
      this.$store.dispatch('abandonDraft', { id: this.draft.id })
        .then(() => {
          this.hideConfirmDialog()
        })
    },
    hideConfirmDialog () {
      this.showingConfirmDialog = false
    },
    handlePosted () {
      console.debug('posted')
      this.doAbandon()
    }
  }
}

export default Draft
