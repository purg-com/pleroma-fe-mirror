import { cloneDeep } from 'lodash'
import { mapState, mapActions } from 'pinia'
import { useServerSideStorageStore } from 'src/stores/serverSideStorage'
import { v4 as uuidv4 } from 'uuid';

import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import UnitSetting from '../helpers/unit_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import HelpIndicator from '../helpers/help_indicator.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Select from 'src/components/select/select.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'

const FilteringTab = {
  data () {
    console.log(cloneDeep(useServerSideStorageStore().prefsStorage.simple.muteFilters))
    return {
      replyVisibilityOptions: ['all', 'following', 'self'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.reply_visibility_${mode}`)
      })),
      muteFiltersDraftObject: cloneDeep(useServerSideStorageStore().prefsStorage.simple.muteFilters),
      muteFiltersDraftDirty: Object.fromEntries(
        Object.entries(
          useServerSideStorageStore().prefsStorage.simple.muteFilters
        ).map(([k]) => [k, false])
      )
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    UnitSetting,
    IntegerSetting,
    Checkbox,
    Select,
    HelpIndicator
  },
  computed: {
    ...SharedComputedObject(),
    ...mapState(
      useServerSideStorageStore,
      {
        muteFilters: store => Object.entries(store.prefsStorage.simple.muteFilters),
        muteFiltersObject: store => store.prefsStorage.simple.muteFilters
      }
    ),
    muteFiltersDraft () {
      return Object.entries(this.muteFiltersDraftObject)
    }
  },
  methods: {
    ...mapActions(useServerSideStorageStore, ['setPreference', 'unsetPreference', 'pushServerSideStorage']),
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
      if (filter.type !== 'user_regexp') return true
      const { value } = filter
      let valid = true
      try {
        new RegExp(value)
      } catch {
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

      this.muteFiltersDraftObject[newId] = filter
      this.setPreference({ path: 'simple.muteFilters.' + newId , value: filter })
      this.pushServerSideStorage()
    },
    copyFilter (id) {
      const filter = { ...this.muteFiltersDraftObject[id] }
      const newId = uuidv4()

      this.muteFiltersDraftObject[newId] = filter
      this.setPreference({ path: 'simple.muteFilters.' + newId , value: filter })
      this.pushServerSideStorage()
    },
    deleteFilter (id) {
      delete this.muteFiltersDraftObject[id]
      this.unsetPreference({ path: 'simple.muteFilters.' + id , value: null })
      this.pushServerSideStorage()
    },
    updateFilter(id, field, value) {
      const filter = { ...this.muteFiltersDraftObject[id] }
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
      this.muteFiltersDraftObject[id] = filter
      this.muteFiltersDraftDirty[id] = true
      console.log(this.muteFiltersDraftDirty)
    },
    saveFilter(id) {
      this.setPreference({ path: 'simple.muteFilters.' + id , value: this.muteFiltersDraftObject[id] })
      this.pushServerSideStorage()
      this.muteFiltersDraftDirty[id] = false
      console.log(this.muteFiltersDraftDirty)
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
