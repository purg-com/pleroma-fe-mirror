import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEnvelope,
  faLock,
  faLockOpen,
  faGlobe,
  faUsers
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEnvelope,
  faGlobe,
  faLock,
  faLockOpen,
  faUsers
)

const ScopeSelector = {
  props: [
    'showAll',
    'userDefault',
    'originalScope',
    'initialScope',
    'onScopeChange'
  ],
  data () {
    return {
      currentScope: this.initialScope
    }
  },
  computed: {
    showNothing () {
      return !this.showPublic && !this.showUnlisted && !this.showPrivate && !this.showDirect && !this.showLocal
    },
    showPublic () {
      return this.shouldShow('public')
    },
    showUnlisted () {
      return this.shouldShow('unlisted')
    },
    showPrivate () {
      return this.shouldShow('private')
    },
    showDirect () {
      return this.shouldShow('direct')
    },
    showLocal () {
      return this.shouldShow('local')
    },
    css () {
      return {
        public: { toggled: this.currentScope === 'public' },
        unlisted: { toggled: this.currentScope === 'unlisted' },
        private: { toggled: this.currentScope === 'private' },
        direct: { toggled: this.currentScope === 'direct' },
        local: { toggled: this.currentScope === 'local' }
      }
    }
  },
  methods: {
    shouldShow (scope) {
      if ((this.originalScope === 'direct' || this.originalScope === 'local') && scope !== this.originalScope) return false

      return this.showAll ||
        this.currentScope === scope ||
        this.originalScope === scope ||
        this.userDefault === scope ||
        scope === 'direct'
    },
    changeVis (scope) {
      this.currentScope = scope
      this.onScopeChange && this.onScopeChange(scope)
    }
  }
}

export default ScopeSelector
