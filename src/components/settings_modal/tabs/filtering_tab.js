import { throttle } from 'lodash'
import { mapState, mapActions } from 'pinia'
import { useServerSideStorageStore } from 'src/stores/serverSideStorage'
import { v4 as uuidv4 } from 'uuid';

import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import UnitSetting from '../helpers/unit_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Select from 'src/components/select/select.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'

const FilteringTab = {
  data () {
    return {
      replyVisibilityOptions: ['all', 'following', 'self'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.reply_visibility_${mode}`)
      }))
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    UnitSetting,
    IntegerSetting,
    Checkbox,
    Select
  },
  computed: {
    ...SharedComputedObject(),
    ...mapState(
      useServerSideStorageStore,
      {
        muteFilters: store => Object.entries(store.prefsStorage.simple.muteFilters),
        muteFiltersObject: store => store.prefsStorage.simple.muteFilters
      }
    )
  },
  methods: {
    ...mapActions(useServerSideStorageStore, ['unsetPreference']),
    pushServerSideStorage: throttle(() => useServerSideStorageStore().pushServerSideStorage(), 500),
    setPreference: throttle(x => useServerSideStorageStore().setPreference(x), 500),
    getDatetimeLocal (timestamp) {
      const date = new Date(timestamp)
      const datetime = [
        date.getFullYear(),
        '-',
        date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1),
        '-',
        date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate(),
        'T',
        date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours(),
        ':',
        date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes(),
      ].join('')
      return datetime
    },
    checkRegexValid (id) {
      const filter = this.muteFiltersObject[id]
      if (filter.type !== 'regexp') return true
      const { value } = filter
      let valid = true
      try {
        new RegExp(value)
      } catch (e) {
        valid = false
        console.error('Invalid RegExp: ' + value)
      }
      return valid
    },
    createFilter () {
      const filter = {
        type: 'word',
        value: '',
        name: 'New Filter',
        enabled: true,
        expires: null,
        hide: false,
        order: this.muteFilters.length + 2
      }
      const newId = uuidv4()

      this.setPreference({ path: 'simple.muteFilters.' + newId , value: filter })
      this.pushServerSideStorage()
    },
    copyFilter (id) {
      const filter = { ...this.muteFiltersObject[id] }
      const newId = uuidv4()

      this.setPreference({ path: 'simple.muteFilters.' + newId , value: filter })
      this.pushServerSideStorage()
    },
    deleteFilter (id) {
      this.unsetPreference({ path: 'simple.muteFilters.' + id , value: null })
      this.pushServerSideStorage()
    },
    updateFilter(id, field, value) {
      const filter = { ...this.muteFiltersObject[id] }
      if (field === 'expires-never') {
        // filter[field] = value
        if (!value) {
          const offset = 1000 * 60 * 60 * 24 * 14 // 2 weeks
          const date = Date.now() + offset
          filter.expires = date
        } else {
          filter.expires = null
        }
      } else if (field === 'expires') {
        const parsed = Date.parse(value)
        filter.expires = parsed.valueOf()
      } else {
        filter[field] = value
      }
      this.setPreference({ path: 'simple.muteFilters.' + id , value: filter })
      this.pushServerSideStorage()
    }
  },
  // Updating nested properties
  watch: {
    replyVisibility () {
      this.$store.dispatch('queueFlushAll')
    }
  }
}

export default FilteringTab
