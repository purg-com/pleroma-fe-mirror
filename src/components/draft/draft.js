import PostStatusForm from 'src/components/post_status_form/post_status_form.vue'

const Draft = {
  components: {
    PostStatusForm
  },
  props: {
    draft: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editing: false
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
    }
  }
}

export default Draft
