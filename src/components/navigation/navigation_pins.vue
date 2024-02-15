<template>
  <span class="NavigationPins">
    <router-link
      v-for="item in pinnedList"
      :key="item.name"
      class="button-unstyled pinned-item"
      activeClass="toggled"
      :to="getRouteTo(item)"
      :title="item.labelRaw || $t(item.label)"
    >
      <FAIcon
        v-if="item.icon"
        fixed-width
        :icon="item.icon"
      />
      <span
        v-if="item.iconLetter"
        class="iconLetter fa-scale-110 fa-old-padding"
      >{{ item.iconLetter }}</span>
      <div
        v-if="item.badgeGetter && getters[item.badgeGetter]"
        class="badge -dot -notification"
      />
    </router-link>
  </span>
</template>

<script src="./navigation_pins.js"></script>

<style lang="scss">
@import "../../variables";

.NavigationPins {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  height: 100%;

  .pinned-item {
    position: relative;
    flex: 1 0 3em;
    min-width: 2em;
    text-align: center;
    overflow: visible;
    box-sizing: border-box;
    height: 100%;

    & .svg-inline--fa,
    & .iconLetter {
      margin: 0;
    }

    &.toggled {
      border-bottom: 4px solid;
    }
  }
}
</style>
