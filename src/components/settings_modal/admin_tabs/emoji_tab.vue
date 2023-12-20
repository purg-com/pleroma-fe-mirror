<template>
  <div
    class="emoji-tab"
    :label="$t('admin_dash.tabs.emoji')"
  >
    <div class="setting-item">
      <h2>{{ $t('admin_dash.tabs.emoji') }}</h2>

      <span class="btn-group">
        <button
          class="button button-default btn"
          type="button"
          @click="reloadEmoji">
          {{ $t('admin_dash.emoji.reload') }}
        </button>
        <button
          class="button button-default btn"
          type="button"
          @click="importFromFS">
          {{ $t('admin_dash.emoji.importFS') }}
        </button>
      </span>

      <tab-switcher :scrollable-tabs="true" v-if="Object.keys(knownPacks).length > 0">
        <div v-for="(pack, packName) in knownPacks" :label="packName" :key="packName">
          <div class="pack-info-wrapper">
            <ul class="setting-list">
              <li>
                <div>Description</div>
                <textarea
                  v-model="pack.pack.description"
                  class="bio resize-height" />
              </li>
              <li>
                <div>Homepage</div>
                <input class="emoji-info-input" v-model="pack.pack.homepage">
              </li>
              <li>
                <div>Fallback source</div>
                <input class="emoji-info-input" v-model="pack.pack['fallback-src']">
              </li>
              <li>
                <Checkbox v-model="pack.pack['can-download']">Downloadable</Checkbox>
              </li>
            </ul>
          </div>

          <h2>Files</h2>

          <ul class="setting-list">
            <li v-for="(file, shortcode) in pack.files" :key="shortcode">
              <StillImage
                class="emoji img"
                :src="emojiAddr(packName, file)"
                :title="`:${shortcode}:`"
                :alt="`:${shortcode}:`"
              />

              <template v-if="editedParts[packName] !== undefined && editedParts[packName][shortcode] !== undefined">
                <input class="emoji-data-input"
                  v-model="editedParts[packName][shortcode].shortcode">
                <input class="emoji-data-input"
                  v-model="editedParts[packName][shortcode].file">

                <button
                  class="button button-default btn"
                  type="button"
                  @click="saveEditedEmoji(packName, shortcode)">
                  Save
                </button>
              </template>
              <template v-else>
                <input disabled class="emoji-data-input" :value="shortcode">
                <input disabled class="emoji-data-input" :value="file">

                <button
                  class="button button-default btn"
                  type="button"
                  @click="editEmoji(packName, shortcode)">
                  Edit
                </button>
              </template>
            </li>
          </ul>
        </div>
      </tab-switcher>
    </div>
  </div>
</template>

<script src="./emoji_tab.js"></script>

<style lang="scss" src="./emoji_tab.scss"></style>
