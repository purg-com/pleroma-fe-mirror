<template>
  <Modal
    :is-open="modalActivated"
    class="settings-modal"
    :class="{ peek: modalPeeked }"
    :no-background="modalPeeked"
  >
    <div class="settings-modal-panel panel">
      <div class="panel-heading">
        <h1 class="title">
          {{ modalMode === 'user' ? $t('settings.settings') : $t('admin_dash.window_title') }}
        </h1>
        <transition name="fade">
          <div
            v-if="currentSaveStateNotice"
            class="alert"
            :class="{ success: !currentSaveStateNotice.error, error: currentSaveStateNotice.error}"
            @click.prevent
          >
            {{ currentSaveStateNotice.error ? $t('settings.saving_err') : $t('settings.saving_ok') }}
          </div>
        </transition>
        <button
          class="btn button-default"
          :title="$t('general.peek')"
          @click="peekModal"
        >
          <FAIcon
            :icon="['far', 'window-minimize']"
            fixed-width
          />
        </button>
        <button
          class="btn button-default"
          :title="$t('general.close')"
          @click="closeModal"
        >
          <FAIcon
            icon="times"
            fixed-width
          />
        </button>
      </div>
      <div class="panel-body">
        <SettingsModalUserContent v-if="modalMode === 'user' && modalOpenedOnceUser" />
        <SettingsModalAdminContent v-if="modalMode === 'admin' && modalOpenedOnceAdmin" />
      </div>
      <div class="panel-footer settings-footer -flexible-height">
        <Popover
          v-if="modalMode === 'user'"
          class="export"
          trigger="click"
          placement="top"
          :offset="{ y: 5, x: 5 }"
          :bound-to="{ x: 'container' }"
          remove-padding
        >
          <template #trigger>
            <button
              class="btn button-default"
              :title="$t('general.close')"
            >
              <span>{{ $t("settings.file_export_import.backup_restore") }}</span>
              {{ ' ' }}
              <FAIcon
                icon="chevron-down"
              />
            </button>
          </template>
          <template #content="{close}">
            <div class="dropdown-menu">
              <div class="menu-item dropdown-item -icon">
                <button
                  class="main-button"
                  @click.prevent="backup"
                  @click="close"
                >
                  <FAIcon
                    icon="file-download"
                    fixed-width
                  /><span>{{ $t("settings.file_export_import.backup_settings") }}</span>
                </button>
              </div>
              <div class="menu-item dropdown-item -icon">
                <button
                  class="main-button"
                  @click.prevent="backupWithTheme"
                  @click="close"
                >
                  <FAIcon
                    icon="file-download"
                    fixed-width
                  /><span>{{ $t("settings.file_export_import.backup_settings_theme") }}</span>
                </button>
              </div>
              <div class="menu-item dropdown-item -icon">
                <button
                  class="main-button"
                  @click.prevent="restore"
                  @click="close"
                >
                  <FAIcon
                    icon="file-upload"
                    fixed-width
                  /><span>{{ $t("settings.file_export_import.restore_settings") }}</span>
                </button>
              </div>
            </div>
          </template>
        </Popover>

        <Checkbox
          :model-value="!!expertLevel"
          @update:model-value="expertLevel = Number($event)"
        >
          {{ $t("settings.expert_mode") }}
        </Checkbox>
        <span v-if="modalMode === 'admin'">
          <i18n-t
            scope="global"
            keypath="admin_dash.wip_notice"
          >
            <template #adminFeLink>
              <a
                href="/pleroma/admin/#/login-pleroma"
                target="_blank"
              >
                {{ $t("admin_dash.old_ui_link") }}
              </a>
            </template>
          </i18n-t>
        </span>
        <span
          id="unscrolled-content"
          class="extra-content"
        />
        <span
          v-if="modalMode === 'admin'"
          class="admin-buttons"
        >
          <button
            class="button-default btn"
            :disabled="!adminDraftAny"
            @click="resetAdminDraft"
          >
            {{ $t("admin_dash.reset_all") }}
          </button>
          {{ ' ' }}
          <button
            class="button-default btn"
            :disabled="!adminDraftAny"
            @click="pushAdminDraft"
          >
            {{ $t("admin_dash.commit_all") }}
          </button>
        </span>
      </div>
    </div>
    <teleport to="#modal">
      <ConfirmModal
        v-if="temporaryChangesTimeoutId"
        :title="$t('settings.confirm_new_setting')"
        :cancel-text="$t('settings.revert')"
        :confirm-text="$t('settings.confirm')"
        @cancelled="temporaryChangesRevert"
        @accepted="temporaryChangesConfirm"
      >
        {{ $t('settings.confirm_new_question') }}
      </ConfirmModal>
    </teleport>
  </Modal>
</template>

<script src="./settings_modal.js"></script>

<style src="./settings_modal.scss" lang="scss"></style>
