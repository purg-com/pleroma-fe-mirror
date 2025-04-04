<template>
  <OptionalRouterLink
    v-slot="{ isActive, href, navigate } = {}"
    :to="routeTo"
  >
    <li
      class="NavigationEntry menu-item"
      :class="{ '-active': isActive }"
      v-bind="$attrs"
    >
      <component
        :is="routeTo ? 'a' : 'button'"
        class="main-link"
        :href="href"
        @click="navigate"
      >
        <span>
          <FAIcon
            v-if="item.icon"
            fixed-width
            class="fa-scale-110 menu-icon"
            :icon="item.icon"
          />
        </span>
        <img
          v-if="item.iconEmojiUrl"
          class="menu-icon iconEmoji iconEmoji-image"
          :src="item.iconEmojiUrl"
          :alt="item.iconEmoji"
          :title="item.iconEmoji"
        >
        <span
          v-else-if="item.iconEmoji"
          class="menu-icon iconEmoji"
        >
          <span>
            {{ item.iconEmoji }}
          </span>
        </span>
        <span
          v-else-if="item.iconLetter"
          class="icon iconLetter fa-scale-110 menu-icon"
        >{{ item.iconLetter }}</span>
        <span class="label">
          {{ item.labelRaw || $t(item.label) }}
        </span>
      </component>
      <slot />
      <div
        v-if="item.badgeGetter && getters[item.badgeGetter]"
        class="badge"
        :class="[`-${item.badgeStyle}`]"
      >
        {{ getters[item.badgeGetter] }}
      </div>
      <div
        v-else-if="item.badgeGetter && item.store && this[`${item.store}Store`][item.badgeGetter]"
        class="badge badge-notification"
      >
        {{ this[`${item.store}Store`][item.badgeGetter] }}
      </div>
      <button
        v-if="showPin && currentUser"
        type="button"
        class="button-unstyled extra-button"
        :title="$t(isPinned ? 'general.unpin' : 'general.pin' )"
        :aria-pressed="!!isPinned"
        @click.stop.prevent="togglePin(item.name)"
      >
        <FAIcon
          v-if="showPin && currentUser"
          fixed-width
          class="fa-scale-110"
          :class="{ 'veryfaint': !isPinned(item.name) }"
          :transform="!isPinned(item.name) ? 'rotate-45' : ''"
          icon="thumbtack"
        />
      </button>
    </li>
  </OptionalRouterLink>
</template>

<script src="./navigation_entry.js"></script>

<style lang="scss">
.NavigationEntry.menu-item {
  --__line-height: 2.5em;
  --__horizontal-gap: 0.5em;
  --__vertical-gap: 0.4em;

  padding: var(--__vertical-gap) var(--__horizontal-gap);
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: var(--__line-height);
  grid-auto-flow: column;
  grid-gap: var(--__horizontal-gap);
  align-items: baseline;

  &[aria-expanded] {
    padding-right: var(--__horizontal-gap);
  }

  .main-link {
    line-height: var(--__line-height);
    box-sizing: border-box;
  }

  .menu-icon {
    line-height: var(--__line-height);
    padding: 0;
    width: var(--__line-height);
    margin-right: var(--__horizontal-gap);
  }

  .timelines-chevron,
  .extra-button {
    line-height: var(--__line-height);
    width: 100%;
    padding: 0;
    text-align: center;
  }

  .badge {
    justify-self: center;
  }

  .iconEmoji {
    display: inline-block;
    text-align: center;
    object-fit: contain;
    vertical-align: middle;
    height: var(--__line-height);
    width: var(--__line-height);

    > span {
      font-size: 1.5rem;
    }
  }

  img.iconEmoji {
    padding: 0.25rem;
    box-sizing: border-box;
  }
}
</style>
