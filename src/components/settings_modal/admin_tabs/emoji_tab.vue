<template>
  <div
    class="emoji-tab"
    :label="$t('admin_dash.tabs.emoji')"
  >
    <div class="setting-item">
      <h2>{{ $t('admin_dash.tabs.emoji') }}</h2>

      <ul class="setting-list">
        <h3>{{ $t('admin_dash.emoji.global_actions') }}</h3>

        <li class="btn-group setting-item">
          <button
            class="button button-default btn"
            type="button"
            @click="reloadEmoji"
          >
            {{ $t('admin_dash.emoji.reload') }}
          </button>
          <button
            class="button button-default btn"
            type="button"
            @click="importFromFS"
          >
            {{ $t('admin_dash.emoji.importFS') }}
          </button>
        </li>

        <li class="btn-group setting-item">
          <button
            class="button button-default btn"
            type="button"
            @click="$refs.remotePackPopover.showPopover"
          >
            {{ $t('admin_dash.emoji.remote_packs') }}

            <Popover
              ref="remotePackPopover"
              popover-class="emoji-tab-edit-popover popover-default"
              trigger="click"
              placement="bottom"
              bound-to-selector=".emoji-tab"
              :bound-to="{ x: 'container' }"
              :offset="{ y: 5 }"
            >
              <template #content>
                <div class="emoji-tab-popover-input">
                  <h3>{{ $t('admin_dash.emoji.remote_pack_instance') }}</h3>
                  <input
                    v-model="remotePackInstance"
                    class="input"
                    :placeholder="$t('admin_dash.emoji.remote_pack_instance')"
                  >
                  <button
                    class="button button-default btn emoji-tab-popover-button"
                    type="button"
                    @click="listRemotePacks"
                  >
                    {{ $t('admin_dash.emoji.do_list') }}
                  </button>
                </div>
              </template>
            </Popover>
          </button>
        </li>

        <h3>{{ $t('admin_dash.emoji.emoji_packs') }}</h3>

        <li>
          <h4>{{ $t('admin_dash.emoji.edit_pack') }}</h4>

          <Select
            v-model="packName"
            class="form-control"
          >
            <option
              value=""
              disabled
              hidden
            >
              {{ $t('admin_dash.emoji.emoji_pack') }}
            </option>
            <option
              v-for="(pack, listPackName) in knownPacks"
              :key="listPackName"
              :label="listPackName"
            >
              {{ listPackName }}
            </option>
          </Select>

          <button
            class="button button-default btn emoji-tab-popover-button"
            type="button"
            @click="$refs.createPackPopover.showPopover"
          >
            {{ $t('admin_dash.emoji.create_pack') }}
          </button>
          <Popover
            ref="createPackPopover"
            popover-class="emoji-tab-edit-popover popover-default"
            trigger="click"
            placement="bottom"
            bound-to-selector=".emoji-tab"
            :bound-to="{ x: 'container' }"
            :offset="{ y: 5 }"
          >
            <template #content>
              <div class="emoji-tab-popover-input">
                <h3>{{ $t('admin_dash.emoji.new_pack_name') }}</h3>
                <input
                  v-model="newPackName"
                  :placeholder="$t('admin_dash.emoji.new_pack_name')"
                  class="input"
                >
                <button
                  class="button button-default btn emoji-tab-popover-button"
                  type="button"
                  @click="createEmojiPack"
                >
                  {{ $t('admin_dash.emoji.create') }}
                </button>
              </div>
            </template>
          </Popover>
        </li>
      </ul>

      <div v-if="pack">
        <div class="pack-info-wrapper">
          <ul class="setting-list">
            <li>
              <label>
                {{ $t('admin_dash.emoji.description') }}
                <ModifiedIndicator
                  :changed="metaEdited('description')"
                  message-key="admin_dash.emoji.metadata_changed"
                />

                <textarea
                  v-model="packMeta.description"
                  :disabled="pack.remote !== undefined"
                  class="bio resize-height input"
                />
              </label>
            </li>
            <li>
              <label>
                {{ $t('admin_dash.emoji.homepage') }}
                <ModifiedIndicator
                  :changed="metaEdited('homepage')"
                  message-key="admin_dash.emoji.metadata_changed"
                />

                <input
                  v-model="packMeta.homepage"
                  class="emoji-info-input input"
                  :disabled="pack.remote !== undefined"
                >
              </label>
            </li>
            <li>
              <label>
                {{ $t('admin_dash.emoji.fallback_src') }}
                <ModifiedIndicator
                  :changed="metaEdited('fallback-src')"
                  message-key="admin_dash.emoji.metadata_changed"
                />

                <input
                  v-model="packMeta['fallback-src']"
                  class="emoji-info-input input"
                  :disabled="pack.remote !== undefined"
                >
              </label>
            </li>
            <li>
              <label>
                {{ $t('admin_dash.emoji.fallback_sha256') }}

                <input
                  v-model="packMeta['fallback-src-sha256']"
                  :disabled="true"
                  class="emoji-info-input input"
                >
              </label>
            </li>
            <li>
              <Checkbox
                v-model="packMeta['share-files']"
                :disabled="pack.remote !== undefined"
              >
                {{ $t('admin_dash.emoji.share') }}
              </Checkbox>

              <ModifiedIndicator
                :changed="metaEdited('share-files')"
                message-key="admin_dash.emoji.metadata_changed"
              />
            </li>
            <li class="btn-group">
              <button
                v-if="pack.remote === undefined"
                class="button button-default btn"
                type="button"
                @click="savePackMetadata"
              >
                {{ $t('admin_dash.emoji.save_meta') }}
              </button>
              <button
                v-if="pack.remote === undefined"
                class="button button-default btn"
                type="button"
                @click="savePackMetadata"
              >
                {{ $t('admin_dash.emoji.revert_meta') }}
              </button>

              <button
                v-if="pack.remote === undefined"
                class="button button-default btn"
                type="button"
                @click="deleteModalVisible = true"
              >
                {{ $t('admin_dash.emoji.delete_pack') }}

                <ConfirmModal
                  v-if="deleteModalVisible"
                  :title="$t('admin_dash.emoji.delete_title')"
                  :cancel-text="$t('status.delete_confirm_cancel_button')"
                  :confirm-text="$t('status.delete_confirm_accept_button')"
                  @cancelled="deleteModalVisible = false"
                  @accepted="deleteEmojiPack"
                >
                  {{ $t('admin_dash.emoji.delete_confirm', [packName]) }}
                </ConfirmModal>
              </button>

              <button
                v-if="pack.remote !== undefined"
                class="button button-default btn"
                type="button"
                @click="$refs.dlPackPopover.showPopover"
              >
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
                        <div class="emoji-tab-popover-input">
                          <label>
                            {{ $t('admin_dash.emoji.download_as_name') }}
                            <input
                              v-model="remotePackDownloadAs"
                              class="emoji-data-input input"
                              :placeholder="$t('admin_dash.emoji.download_as_name_full')"
                            >
                          </label>

                          <div
                            v-if="downloadWillReplaceLocal"
                            class="warning"
                          >
                            <em>{{ $t('admin_dash.emoji.replace_warning') }}</em>
                          </div>
                        </div>

                        <button
                          class="button button-default btn"
                          type="button"
                          @click="downloadRemotePack"
                        >
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

        <ul class="setting-list">
          <h4>
            {{ $t('admin_dash.emoji.files') }}

            <ModifiedIndicator
              v-if="pack"
              :changed="$refs.emojiPopovers && $refs.emojiPopovers.some(p => p.isEdited)"
              message-key="admin_dash.emoji.emoji_changed"
            />
          </h4>

          <div
            v-if="pack"
            class="emoji-list"
          >
            <EmojiEditingPopover
              v-if="pack.remote === undefined"
              placement="bottom"
              new-upload
              :title="$t('admin_dash.emoji.adding_new')"
              :pack-name="packName"
              @update-pack-files="updatePackFiles"
              @display-error="displayError"
            >
              <template #trigger>
                <FAIcon
                  icon="plus"
                  size="2x"
                  :title="$t('admin_dash.emoji.add_file')"
                />
              </template>
            </EmojiEditingPopover>

            <EmojiEditingPopover
              v-for="(file, shortcode) in pack.files"
              ref="emojiPopovers"
              :key="shortcode"
              placement="top"
              :title="$t('admin_dash.emoji.editing', [shortcode])"
              :disabled="pack.remote !== undefined"
              :shortcode="shortcode"
              :file="file"
              :pack-name="packName"
              @update-pack-files="updatePackFiles"
              @display-error="displayError"
            >
              <template #trigger>
                <StillImage
                  class="emoji"
                  :src="emojiAddr(file)"
                  :title="`:${shortcode}:`"
                  :alt="`:${shortcode}:`"
                />
              </template>
            </EmojiEditingPopover>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="./emoji_tab.js"></script>

<style lang="scss" src="./emoji_tab.scss"></style>
