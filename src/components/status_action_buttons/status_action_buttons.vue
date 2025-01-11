<template>
  <div class="StatusActionButtons">
    <span class="quick-action-buttons">
      <span
        class="quick-action"
        v-for="button in quickButtons"
        :key="button.name"
      >
        <component
          :is="component(button)"
          class="button-unstyled"
          :class="getClass(button)"
          role="button"
          :tabindex="0"
          :title="$t(button.label(funcArg))"
          @click.stop="component(button) === 'button' && doAction(button)"
          :href="component(button) == 'a' ? button.link?.(funcArg) || getRemoteInteractionLink : undefined"
        >
          <FALayers class="fa-old-padding">
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
        </component>
        <span
          class="action-counter"
          v-if="button.counter?.(funcArg) > 0"
        >
          {{ button.counter?.(funcArg) }}
        </span>
      </span>
      <Popover
        trigger="click"
        :trigger-attrs="triggerAttrs"
        :tabindex="0"
        placement="top"
        :offset="{ y: 5 }"
        :bound-to="{ x: 'container2' }"
        remove-padding
        @show="onShow"
        @close="onClose"
      >
        <template #trigger>
          <span class="popover-trigger">
            <FALayers class="fa-old-padding-layer">
              <FAIcon
                class="fa-scale-110 "
                icon="ellipsis-h"
              />
            </FALayers>
          </span>
        </template>
        <template #content="{close}">
          <div
            :id="`popup-menu-${randomSeed}`"
            class="dropdown-menu"
            role="menu"
          >
            <component
              v-for="button in extraButtons"
              :key="button.name"
              :is="component(button)"
              class="menu-item dropdown-item dropdown-item-icon"
              role="menuitem"
              :class="getClass(button)"
              :tabindex="0"
              @click.stop="component(button) === 'button' && doAction(button)"
              @click="close"
              :href="component(button) == 'a' ? button.link?.(funcArg) || getRemoteInteractionLink : undefined"
            >
              <FAIcon
                class="fa-scale-110"
                :icon="button.icon(funcArg)"
              /><span>{{ $t(button.label(funcArg)) }}</span>
            </component>
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

<style lang="scss">
@import "../../mixins";

.StatusActionButtons {
  .quick-action-buttons {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    grid-gap: 1em;
    margin-top: var(--status-margin);

    .quick-action {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-gap: 0.5em;
      max-width: 4em;

      .reply-button {
        &:hover,
        &.-active {
          .svg-inline--fa {
            color: var(--cBlue);
          }
        }
      }

      .retweet-button {
        &:hover,
        &.-active {
          .svg-inline--fa {
            color: var(--cGreen);
          }
        }
      }

      .favorite-button {
        &:hover,
        &.-active {
          .svg-inline--fa {
            color: var(--cOrange);
          }
        }
      }

      > button,
      > a {
        padding: 0.5em;
        margin: -0.5em;
      }

      @include unfocused-style {
        .focus-marker {
          visibility: hidden;
        }

        .active-marker {
          visibility: visible;
        }
      }

      @include focused-style {
        .focus-marker {
          visibility: visible;
        }

        .active-marker {
          visibility: hidden;
        }
      }
    }
  }
}

</style>
