<template>
  <div class="StatusActionButtons">
    <span class="quick-action-buttons">
      <span
        class="quick-action"
        :class="{ '-pin': showPin, '-toggle': button.dropdown?.() }"
        v-for="button in quickButtons"
        :key="button.name"
      >
        <component
          :is="component(button)"
          class="button-unstyled action-button"
          :class="getClass(button)"
          role="button"
          :tabindex="0"
          :title="$t(button.label(funcArg))"
          @click.stop="component(button) === 'button' && doAction(button)"
          :href="component(button) == 'a' ? button.link?.(funcArg) || getRemoteInteractionLink : undefined"
        >
          <FALayers>
            <FAIcon
              class="fa-scale-110"
              :icon="button.icon(funcArg)"
            />
            <template v-if="button.toggleable?.(funcArg) && button.active">
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
          </FALayers>
          <span
            class="action-counter"
            v-if="button.counter?.(funcArg) > 0"
          >
            {{ button.counter?.(funcArg) }}
          </span>
        </component>
        <button
          v-if="showPin && currentUser"
          type="button"
          class="button-unstyled pin-action-button"
          :title="$t('general.unpin')"
          :aria-pressed="true"
          @click.stop.prevent="unpin(button)"
        >
          <FAIcon
            v-if="showPin && currentUser"
            fixed-width
            class="fa-scale-110"
            icon="thumbtack"
          />
        </button>
      </span>
      <Popover
        trigger="click"
        :trigger-attrs="triggerAttrs"
        :tabindex="0"
        placement="top"
        :offset="{ y: 5 }"
        :bound-to="{ x: 'container' }"
        remove-padding
        @show="onShow"
        @close="onClose"
      >
        <template #trigger>
          <FAIcon
            class="fa-scale-110 "
            icon="ellipsis-h"
          />
        </template>
        <template #content="{close}">
          <div
            :id="`popup-menu-${randomSeed}`"
            class="dropdown-menu extra-action-buttons"
            role="menu"
          >
            <div class="menu-item dropdown-item extra-action dropdown-item-icon">
              <button
                class="main-button"
                role="menuitem"
                :tabindex="0"
                @click.stop="showPin = !showPin"
              >
                <FAIcon
                  class="fa-scale-110"
                  fixed-width
                  icon="wrench"
                /><span>{{ $t('nav.edit_pinned') }}</span>
              </button>
            </div>
            <div
              v-for="button in extraButtons"
              :key="button.name"
              class="menu-item dropdown-item extra-action dropdown-item-icon"
            >
              <component
                :is="component(button)"
                class="main-button"
                role="menuitem"
                :class="getClass(button)"
                :tabindex="0"
                @click.stop="component(button) === 'button' && doAction(button)"
                @click="close"
                :href="component(button) == 'a' ? button.link?.(funcArg) || getRemoteInteractionLink : undefined"
              >
                <FAIcon
                  class="fa-scale-110"
                  fixed-width
                  :icon="button.icon(funcArg)"
                /><span>{{ $t(button.label(funcArg)) }}</span>
              </component>
              <button
                v-if="showPin && currentUser"
                type="button"
                class="button-unstyled pin-action-button"
                :title="$t('general.pin' )"
                :aria-pressed="false"
                @click.stop.prevent="pin(button)"
              >
                <FAIcon
                  v-if="showPin && currentUser"
                  fixed-width
                  class="fa-scale-110"
                  transform="rotate-45"
                  icon="thumbtack"
                />
              </button>
            </div>
          </div>
        </template>
      </Popover>
    </span>

    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmDialog"
        :title="currentConfirmTitle"
        :confirm-text="currentConfirmOkText"
        :cancel-text="currentConfirmCancelText"
        @accepted="currentConfirmAction"
        @cancelled="hideConfirmDialog"
      >
        {{ $t('status.repeat_confirm') }}
      </confirm-modal>
    </teleport>
  </div>
</template>

<script src="./status_action_buttons.js"></script>

<style lang="scss" src="./status_action_buttons.scss"></style>
