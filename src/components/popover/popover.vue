<template>
  <span
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <button
      ref="trigger"
      class="popover-trigger-button"
      :class="normalButton ? 'button-default btn' : 'button-unstyled'"
      type="button"
      v-bind="triggerAttrs"
      @click="onClick"
    >
      <slot name="trigger" />
    </button>
    <teleport
      :disabled="!teleport"
      to="#popovers"
    >
      <transition name="fade">
        <div
          v-if="!hidden"
          ref="content"
          :style="styles"
          class="popover"
          :class="popoverClass || 'popover-default'"
          @mouseenter="onMouseenterContent"
          @mouseleave="onMouseleaveContent"
          @click="onClickContent"
        >
          <slot
            name="content"
            class="popover-inner"
            :close="hidePopover"
          />
        </div>
      </transition>
    </teleport>
  </span>
</template>

<script src="./popover.js" />

<style lang="scss">
.popover-trigger-button {
  display: inline-block;
}

.popover {
  z-index: var(--ZI_popover_override, var(--ZI_popovers));
  position: fixed;
  min-width: 0;
  max-width: calc(100vw - 20px);
  box-shadow: var(--shadow);
}

.popover-default {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 3;
    box-shadow: var(--shadow);
    pointer-events: none;
  }

  border-radius: var(--roundness);
  border-color: var(--border);
  border-style: solid;
  border-width: 1px;
}

.dropdown-menu {
  display: block;
  padding: 0;
  font-size: 1em;
  text-align: left;
  list-style: none;
  max-width: 100vw;
  z-index: var(--ZI_popover_override, var(--ZI_popovers));
  white-space: nowrap;

  .dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid var(--border);
  }

  .dropdown-item {
    border: none;

    &-icon {
      svg {
        width: var(--__line-height);
        margin-right: var(--__horizontal-gap);
      }
    }

    &.-has-submenu {
      .chevron-icon {
        margin-right: 0.25rem;
        margin-left: 2rem;
      }
    }

    .menu-checkbox {
      display: inline-block;
      vertical-align: middle;
      min-width: calc(var(--__line-height) + 1px);
      max-width: calc(var(--__line-height) + 1px);
      min-height: calc(var(--__line-height) + 1px);
      max-height: calc(var(--__line-height) + 1px);
      line-height: var(--__line-height);
      text-align: center;
      border-radius: 0;
      box-shadow: var(--shadow);
      margin-right: var(--__horizontal-gap);

      &.menu-checkbox-checked::after {
        font-size: 1.25em;
        content: "✓";
      }

      &.-radio {
        border-radius: 9999px;

        &.menu-checkbox-checked::after {
          font-size: 2em;
          content: "•";
        }
      }
    }
  }
}
</style>
