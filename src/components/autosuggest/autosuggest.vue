<!-- FIXME THIS NEEDS TO BE REFACTORED TO USE POPOVER -->
<template>
  <div
    v-click-outside="onClickOutside"
    class="autosuggest"
  >
    <input
      v-model="term"
      :placeholder="placeholder"
      class="input autosuggest-input"
      @click="onInputClick"
    >
    <div
      v-if="resultsVisible && filtered.length > 0"
      class="panel autosuggest-results"
    >
      <slot
        v-for="item in filtered"
        :item="item"
      />
    </div>
  </div>
</template>

<script src="./autosuggest.js"></script>

<style lang="scss">
@import "../../variables";

.autosuggest {
  position: relative;

  &-input {
    display: block;
    width: 100%;
  }

  &-results {
    position: absolute;
    left: 0;
    top: 100%;
    right: 0;
    max-height: 400px;
    background-color: $fallback--bg;
    background-color: var(--bg, $fallback--bg);
    border-style: solid;
    border-width: 1px;
    border-color: $fallback--border;
    border-color: var(--border);
    border-radius: var(--roundness);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    box-shadow: 1px 1px 4px rgb(0 0 0 / 60%);
    box-shadow: var(--shadow);
    overflow-y: auto;
    z-index: 1;
  }
}
</style>
