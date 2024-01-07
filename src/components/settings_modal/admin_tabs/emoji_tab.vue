<template>
  <div
    class="emoji-tab"
    :label="$t('admin_dash.tabs.emoji')"
  >
    <div class="setting-item">
      <h2>{{ $t('admin_dash.tabs.emoji') }}</h2>

      <ul class="setting-list">
        <li class="btn-group setting-item">
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
        </li>

        <li class="btn-group setting-item">
          <button
            class="button button-default btn"
            type="button"
            @click="$refs.createPackPopover.showPopover">
            Create pack
          </button>
          <Popover
            ref="createPackPopover"
            trigger="click"
            placement="bottom"
            bound-to-selector=".emoji-tab"
            :bound-to="{ x: 'container' }"
            :offset="{ y: 5 }"
          >
            <template #content>
              <input v-model="newPackName" placeholder="New pack name">
              <button
                class="button button-default btn emoji-tab-popover-button"
                type="button"
                @click="createEmojiPack">
                Create
              </button>
            </template>
          </Popover>

          <button
            class="button button-default btn"
            :disabled="packName == ''"
            type="button"
            @click="deleteModalVisible = true">
            Delete pack
          </button>
          <ConfirmModal
            v-if="deleteModalVisible"
            title="Delete?"
            :cancel-text="$t('status.delete_confirm_cancel_button')"
            :confirm-text="$t('status.delete_confirm_accept_button')"
            @cancelled="deleteModalVisible = false"
            @accepted="deleteEmojiPack" >
            Are you sure you want to delete <i>{{ packName }}</i>?
          </ConfirmModal>
        </li>

        <li>
          <Select class="form-control" v-model="packName">
            <option value="" disabled hidden>Emoji pack</option>
            <option v-for="(pack, listPackName) in knownPacks" :label="listPackName" :key="listPackName">
              {{ listPackName }}
            </option>
          </Select>
        </li>
      </ul>

      <div v-if="packName !== ''">
        <div class="pack-info-wrapper">
          <ul class="setting-list">
            <li>
              <div>
                Description
                <ModifiedIndicator :changed="metaEdited('description')" />
              </div>
              <textarea
                v-model="packMeta.description"
                class="bio resize-height" />
            </li>
            <li>
              <div>
                Homepage
                <ModifiedIndicator :changed="metaEdited('homepage')" />
              </div>
              <input class="emoji-info-input" v-model="packMeta.homepage">
            </li>
            <li>
              <div>
                Fallback source
                <ModifiedIndicator :changed="metaEdited('fallback-src')" />
              </div>
              <input class="emoji-info-input" v-model="packMeta['fallback-src']">
            </li>
            <li>
              <div>Fallback SHA256</div>
              <input :disabled="true" class="emoji-info-input" v-model="packMeta['fallback-src-sha256']">
            </li>
            <li>
              <Checkbox v-model="packMeta['share-files']">Share</Checkbox>

              <ModifiedIndicator :changed="metaEdited('share-files')" />
            </li>
            <li class="btn-group">
              <button
                class="button button-default btn"
                type="button"
                @click="savePackMetadata">
                Save
              </button>

              <Popover
                ref="addEmojiPopover"
                trigger="click"
                placement="bottom"
                bound-to-selector=".emoji-tab"
                popover-class="emoji-tab-edit-popover popover-default"
                :bound-to="{ x: 'container' }"
                :offset="{ y: 5 }"
              >
                <template #content>
                  <h3>Adding new emoji</h3>
                  <div>
                    <input
                      type="file"
                      class="emoji-tab-popover-input emoji-tab-popover-file"
                      @change="newEmojiUpload.upload = $event.target.files"
                    >
                  </div>
                  <div>
                    <div>
                      <input class="emoji-data-input emoji-tab-popover-input"
                        v-model="newEmojiUpload.shortcode"
                        placeholder="Shortcode, leave blank to infer">
                      <input class="emoji-data-input emoji-tab-popover-input"
                        v-model="newEmojiUpload.file"
                        placeholder="Filename, leave blank infer">

                      <button
                        class="button button-default btn emoji-tab-popover-button"
                        type="button"
                        :disabled="this.newEmojiUpload.upload.length == 0"
                        @click="uploadEmoji">
                        Save
                      </button>
                    </div>
                  </div>
                </template>
              </Popover>
              <button
                class="button button-default btn"
                type="button"
                @click="$refs.addEmojiPopover.showPopover">
                Add file
              </button>
            </li>
          </ul>
        </div>

        <h2>Files</h2>

        <div class="emoji-list" v-if="pack">
          <Popover
            v-for="(file, shortcode) in pack.files" :key="shortcode"
            trigger="click"
            placement="top"
            :class="{'emoji-unsaved': editedParts[packName] !== undefined && editedParts[packName][shortcode] !== undefined}"
            popover-class="emoji-tab-edit-popover popover-default"
            bound-to-selector=".emoji-list"
            :bound-to="{ x: 'container' }"
            :offset="{ y: 5 }"
            @show="editEmoji(shortcode)"
          >
            <template #content>
              <h3>
                Editing <i>{{ shortcode }}</i>
              </h3>
              <div v-if="editedParts[packName] !== undefined && editedParts[packName][shortcode] !== undefined">
                <input class="emoji-data-input"
                  v-model="editedParts[packName][shortcode].shortcode">
                <input class="emoji-data-input"
                  v-model="editedParts[packName][shortcode].file">

                <button
                  class="button button-default btn emoji-tab-popover-button"
                  type="button"
                  @click="saveEditedEmoji(shortcode)">
                  Save
                </button>
                <button
                  class="button button-default btn emoji-tab-popover-button"
                  type="button"
                  @click="editedParts[packName][shortcode].deleteModalVisible = true">
                  Delete
                </button>
                <ConfirmModal
                  v-if="editedParts[packName][shortcode].deleteModalVisible"
                  title="Delete?"
                  :cancel-text="$t('status.delete_confirm_cancel_button')"
                  :confirm-text="$t('status.delete_confirm_accept_button')"
                  @cancelled="editedParts[packName][shortcode].deleteModalVisible = false"
                  @accepted="deleteEmoji(shortcode)" >
                  Are you sure you want to delete <i>{{ shortcode }}</i>?
                </ConfirmModal>
              </div>
            </template>
            <template #trigger>
              <StillImage
                class="emoji"
                :src="emojiAddr(file)"
                :title="`:${shortcode}:`"
                :alt="`:${shortcode}:`"
              />
            </template>
          </Popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./emoji_tab.js"></script>

<style lang="scss" src="./emoji_tab.scss"></style>
