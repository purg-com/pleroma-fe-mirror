<template>
  <div
    class="action-button"
    :class="buttonClass"
  >
    <component
      :is="getComponent(button)"
      class="action-button-inner"
      :class="buttonInnerClass"
      role="menuitem"
      :tabindex="0"
      :disabled="buttonClass.disabled"
      :href="getComponent(button) == 'a' ? button.link?.(funcArg) || getRemoteInteractionLink : undefined"
      @click.prevent="doActionWrap(button)"
      @click="button.name === 'emoji' ? () => {} : close()"
    >
      <FALayers>
        <FAIcon
          class="fa-scale-110"
          :icon="button.icon(funcArg)"
          :spin="!extra && button.animated?.() && animationState[button.name]"
          fixed-width
        />
        <template v-if="!buttonClass.disabled && button.toggleable?.(funcArg) && button.active">
          <FAIcon
            v-if="button.active(funcArg)"
            class="active-marker"
            transform="shrink-6 up-9 right-15"
            :icon="button.activeIndicator?.(funcArg) || 'check'"
          />
          <FAIcon
            v-if="!button.active(funcArg)"
            class="focus-marker"
            transform="shrink-6 up-9 right-15"
            :icon="button.openIndicator?.(funcArg) || 'plus'"
          />
          <FAIcon
            v-else
            class="focus-marker"
            transform="shrink-6 up-9 right-15"
            :icon="button.closeIndicator?.(funcArg) || 'minus'"
          />
        </template>
      </FALayers>
      <span
        v-if="extra"
        class="action-label"
      >
        {{ $t(button.label(funcArg)) }}
      </span>
      <span
        v-if="!extra && button.counter?.(funcArg) > 0"
        class="action-counter"
      >
        {{ button.counter?.(funcArg) }}
      </span>
      <FAIcon
        v-if="button.dropdown?.()"
        class="chevron-icon"
        size="lg"
        :icon="extra ? 'chevron-right' : 'chevron-up'"
        fixed-width
      />
    </component>
    <span
      v-if="!extra && button.name === 'bookmark'"
      class="separator"
    >
    </span>
    <Popover
      trigger="hover"
      :placement="extra ? 'right' : 'top'"
      :trigger-attrs="{ class: 'extra-button' }"
      v-if="button.name === 'bookmark'"
    >
      <template #trigger>
        <FAIcon
          class="chevron-icon"
          size="lg"
          :icon="extra ? 'chevron-right' : 'chevron-up'"
          fixed-width
        />
      </template>
      <template #content>
        <StatusBookmarkFolderMenu v-if="button.name === 'bookmark'" :status="status" />
      </template>
    </Popover>

    <EmojiPicker
      ref="picker"
      v-if="button.name === 'emoji'"
      :enable-sticker-picker="false"
      :hide-custom-emoji="hideCustomEmoji"
      class="emoji-picker-panel"
      @emoji="addReaction"
    />
  </div>
</template>

<script src="./action_button.js"/>

<style lang="scss" src="./action_button.scss"/>
