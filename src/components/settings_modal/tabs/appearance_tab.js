import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import FloatSetting from '../helpers/float_setting.vue'
import UnitSetting from '../helpers/unit_setting.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'
import ProfileSettingIndicator from '../helpers/profile_setting_indicator.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGlobe
)

const AppearanceTab = {
  data () {
    return {}
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting,
    FloatSetting,
    UnitSetting,
    ProfileSettingIndicator
  },
  computed: {
    instanceWallpaperUsed () {
      return this.$store.state.instance.background &&
        !this.$store.state.users.currentUser.background_image
    },
    ...SharedComputedObject()
  }
}

export default AppearanceTab
