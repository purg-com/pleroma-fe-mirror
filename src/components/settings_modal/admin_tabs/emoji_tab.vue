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
            {{ $t('admin_dash.emoji.create_pack') }}
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
              <input v-model="newPackName" :placeholder="$t('admin_dash.emoji.new_pack_name')">
              <button
                class="button button-default btn emoji-tab-popover-button"
                type="button"
                @click="createEmojiPack">
                {{ $t('admin_dash.emoji.create') }}
              </button>
            </template>
          </Popover>

          <button
            class="button button-default btn"
            type="button"
            @click="$refs.remotePackPopover.showPopover">
            {{ $t('admin_dash.emoji.remote_packs') }}

            <Popover
              ref="remotePackPopover"
              trigger="click"
              placement="bottom"
              bound-to-selector=".emoji-tab"
              :bound-to="{ x: 'container' }"
              :offset="{ y: 5 }"
            >
              <template #content>
                <input v-model="remotePackInstance" :placeholder="$t('admin_dash.emoji.remote_pack_instance')">
                <button
                  class="button button-default btn emoji-tab-popover-button"
                  type="button"
                  @click="listRemotePacks">
                  {{ $t('admin_dash.emoji.do_list') }}
                </button>
              </template>
            </Popover>
          </button>
        </li>

        <li>
          <Select class="form-control" v-model="packName">
            <option value="" disabled hidden>{{ $t('admin_dash.emoji.emoji_pack') }}</option>
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
                {{ $t('admin_dash.emoji.description') }}
                <ModifiedIndicator :changed="metaEdited('description')" />
              </div>
              <textarea
                v-model="packMeta.description"
                :disabled="pack.remote !== undefined"
                class="bio resize-height" />
            </li>
            <li>
              <div>
                {{ $t('admin_dash.emoji.homepage') }}
                <ModifiedIndicator :changed="metaEdited('homepage')" />
              </div>
              <input
                class="emoji-info-input" v-model="packMeta.homepage"
                :disabled="pack.remote !== undefined">
            </li>
            <li>
              <div>
                {{ $t('admin_dash.emoji.fallback_src') }}
                <ModifiedIndicator :changed="metaEdited('fallback-src')" />
              </div>
              <input class="emoji-info-input" v-model="packMeta['fallback-src']" :disabled="pack.remote !== undefined">
            </li>
            <li>
              <div>{{ $t('admin_dash.emoji.fallback_sha256') }}</div>
              <input :disabled="true" class="emoji-info-input" v-model="packMeta['fallback-src-sha256']">
            </li>
            <li>
              <Checkbox :disabled="pack.remote !== undefined" v-model="packMeta['share-files']">
                {{ $t('admin_dash.emoji.share') }}
              </Checkbox>

              <ModifiedIndicator :changed="metaEdited('share-files')" />
            </li>
            <li class="btn-group">
              <button
                class="button button-default btn"
                type="button"
                v-if="pack.remote === undefined"
                @click="savePackMetadata">
                {{ $t('admin_dash.emoji.save') }}
              </button>

              <button
                class="button button-default btn"
                type="button"
                v-if="pack.remote === undefined"
                @click="$refs.addEmojiPopover.showPopover">
                {{ $t('admin_dash.emoji.add_file') }}

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
                    <h3>{{ $t('admin_dash.emoji.adding_new') }}</h3>
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
                          :placeholder="$t('admin_dash.emoji.new_shortcode')">
                        <input class="emoji-data-input emoji-tab-popover-input"
                          v-model="newEmojiUpload.file"
                          :placeholder="$t('admin_dash.emoji.new_filename')">

                        <button
                          class="button button-default btn emoji-tab-popover-button"
                          type="button"
                          :disabled="this.newEmojiUpload.upload.length == 0"
                          @click="uploadEmoji">
                          {{ $t('admin_dash.emoji.save') }}
                        </button>
                      </div>
                    </div>
                  </template>
                </Popover>
              </button>

              <button
                class="button button-default btn"
                v-if="pack.remote === undefined"
                type="button"
                @click="deleteModalVisible = true">
                {{ $t('admin_dash.emoji.delete_pack') }}

                <ConfirmModal
                  v-if="deleteModalVisible"
                  :title="$t('admin_dash.emoji.delete_title')"
                  :cancel-text="$t('status.delete_confirm_cancel_button')"
                  :confirm-text="$t('status.delete_confirm_accept_button')"
                  @cancelled="deleteModalVisible = false"
                  @accepted="deleteEmojiPack" >
                  {{ $t('admin_dash.emoji.delete_confirm', packName) }}
                </ConfirmModal>
              </button>

              <button
                class="button button-default btn"
                type="button"
                v-if="pack.remote !== undefined"
                @click="$refs.dlPackPopover.showPopover">
                {{ $t('admin_dash.emoji.download_pack') }}

                <Popover
                  ref="dlPackPopover"
                  trigger="click"
                  placement="bottom"
                  bound-to-selector=".emoji-tab"
                  popover-class="emoji-tab-edit-popover popover-default"
                  :bound-to="{ x: 'container' }"
                  :offset="{ y: 5 }"
                >
                  <template #content>
                    <h3>{{ $t('admin_dash.emoji.downloading_pack', [packName]) }}</h3>
                    <div>
                      <div>
                        <input class="emoji-data-input emoji-tab-popover-input"
                          v-model="remotePackDownloadAs"
                          :placeholder="$t('admin_dash.emoji.download_as_name')">

                        <button
                          class="button button-default btn emoji-tab-popover-button"
                          type="button"
                          @click="downloadRemotePack">
                          {{ $t('admin_dash.emoji.download') }}
                        </button>
                      </div>
                    </div>
                  </template>
                </Popover>
              </button>
            </li>
          </ul>
        </div>

        <h2>{{ $t('admin_dash.emoji.files') }}</h2>

        <div class="emoji-list" v-if="pack">
          <Popover
            v-for="(file, shortcode) in pack.files" :key="shortcode"
            trigger="click"
            :disabled="pack.remote !== undefined"
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
                {{ $t('admin_dash.emoji.editing', [shortcode]) }}
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
                  {{ $t('admin_dash.emoji.save') }}
                </button>
                <button
                  class="button button-default btn emoji-tab-popover-button"
                  type="button"
                  @click="editedParts[packName][shortcode].deleteModalVisible = true">
                  {{ $t('admin_dash.emoji.delete') }}
                </button>
                <ConfirmModal
                  v-if="editedParts[packName][shortcode].deleteModalVisible"
                  :title="$t('admin_dash.emoji.delete_title')"
                  :cancel-text="$t('status.delete_confirm_cancel_button')"
                  :confirm-text="$t('status.delete_confirm_accept_button')"
                  @cancelled="editedParts[packName][shortcode].deleteModalVisible = false"
                  @accepted="deleteEmoji(shortcode)" >
                  {{ $t('admin_dash.emoji.delete_confirm', shortcode) }}
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
