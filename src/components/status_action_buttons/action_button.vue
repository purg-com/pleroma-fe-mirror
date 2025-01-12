<template>
  <div>
    <component
      :is="getComponent(button)"
      class="main-button"
      role="menuitem"
      :tabindex="0"
      :disabled="getClass(button).disabled"
      :href="getComponent(button) == 'a' ? button.link?.(funcArg) || getRemoteInteractionLink : undefined"
      @click.stop="getComponent(button) === 'button' && doAction(button)"
      @click="close"
    >
      <FALayers>
        <FAIcon
          class="fa-scale-110"
          :icon="button.icon(funcArg)"
          :spin="!extra && button.animated?.() && animationState[button.name]"
          :fixed-width="extra"
        />
        <template v-if="!getClass(button).disabled && button.toggleable?.(funcArg) && button.active">
          <FAIcon
            v-if="button.active(funcArg)"
            class="active-marker"
            transform="shrink-6 up-9 right-12"
            :icon="button.activeIndicator?.(funcArg) || 'check'"
          />
          <FAIcon
            v-if="!button.active(funcArg)"
            class="focus-marker"
            transform="shrink-6 up-9 right-12"
            :icon="button.openIndicator?.(funcArg) || 'plus'"
          />
          <FAIcon
            v-else
            class="focus-marker"
            transform="shrink-6 up-9 right-12"
            :icon="button.closeIndicator?.(funcArg) || 'minus'"
          />
        </template>
      </FALayers><span>{{ $t(button.label(funcArg)) }}</span>
      <FAIcon
        v-if="button.name === 'mute'"
        class="chevron-icon"
        size="lg"
        icon="chevron-right"
        fixed-width
      />
    </component>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus,
  faMinus,
  faCheck,
  faTimes,
  faWrench,

  faReply,
  faRetweet,
  faStar,
  faSmileBeam,

  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import {
  faStar as faStarRegular
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faPlus,
  faMinus,
  faCheck,
  faTimes,
  faWrench,

  faReply,
  faRetweet,
  faStar,
  faStarRegular,
  faSmileBeam,

  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faHistory
)

export default {
  props: [
    'button',
    'extra',
    'status',
    'funcArg',
    'animationState',
    'getClass',
    'getComponent',
    'doAction',
    'close'
  ]
}
</script>
