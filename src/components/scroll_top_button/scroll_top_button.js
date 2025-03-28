const ScrollTopButton = {
  computed: {
    scrollParent () { return this.$store.state.instance.scrollParentIsWindow ? window : this.$refs.appContentRef }
  },
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

export default ScrollTopButton
