<template>
  <span
    v-if="changed"
    class="ModifiedIndicator"
  >
    <Popover
      trigger="hover"
      :trigger-attrs="{ 'aria-label': $t('settings.setting_changed') }"
    >
      <template #trigger>
        &nbsp;
        <FAIcon
          icon="wrench"
        />
      </template>
      <template #content>
        <div class="modified-tooltip">
          {{ $t(messageKey) }}
        </div>
      </template>
    </Popover>
  </span>
</template>

<script>
import Popover from 'src/components/popover/popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(
  faWrench
)

export default {
  components: { Popover },
  props: {
    changed: Boolean,
    messageKey: {
      type: String,
      default: 'settings.setting_changed'
    }
  }
}
</script>

<style lang="scss">
.ModifiedIndicator {
  display: inline-block;
  position: relative;
}

.modified-tooltip {
  margin: 0.5em 1em;
  min-width: 10em;
  text-align: center;
}
</style>
