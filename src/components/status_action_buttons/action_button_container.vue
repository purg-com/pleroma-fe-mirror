<template>
  <div>
    <Popover
      trigger="hover"
      :placement="$attrs.extra ? 'right' : 'top'"
      v-if="button.dropdown?.()"
    >
      <template #trigger>
        <ActionButton
          :button="button"
          :status="status"
          v-bind.prop="$attrs"
        />
      </template>
      <template #content>
        <div
          v-if="button.name === 'mute'"
          class="dropdown-menu"
          :id="`popup-menu-${randomSeed}`"
          role="menu"
        >
          <div class="menu-item dropdown-item extra-action -icon">
            <button
              class="main-button"
              @click="toggleUserMute"
            >
              <FAIcon icon="user" fixed-width />
              <template v-if="userIsMuted">
                {{ $t('status.unmute_user') }}
              </template>
              <template v-else>
                {{ $t('status.mute_user') }}
              </template>
            </button>
          </div>
          <div class="menu-item dropdown-item extra-action -icon">
            <button
              class="main-button"
              @click="toggleUserMute"
            >
              <FAIcon icon="folder-tree" fixed-width />
              <template v-if="threadIsMuted">
                {{ $t('status.unmute_conversation') }}
              </template>
              <template v-else>
                {{ $t('status.mute_conversation') }}
              </template>
            </button>
          </div>
          <div class="menu-item dropdown-item extra-action -icon">
            <button
              class="main-button"
              @click="toggleDomainMute"
            >
              <FAIcon icon="globe" fixed-width />
              <template v-if="domainIsMuted">
                {{ $t('status.unmute_domain') }}
              </template>
              <template v-else>
                {{ $t('status.mute_domain') }}
              </template>
            </button>
          </div>
        </div>
      </template>
    </Popover>
    <ActionButton
      v-else
      :button="button"
      :status="status"
      v-bind="$attrs"
    />
    <teleport to="#modal">
      <mute-confirm
        type="conversation"
        :status="this.status"
        ref="confirmConversation"
      />
      <mute-confirm
        type="domain"
        :user="this.user"
        ref="confirmDomain"
      />
      <mute-confirm
        type="user"
        :user="this.user"
        ref="confirmUser"
      />
    </teleport>
  </div>
</template>

<script src="./action_button_container.js"/>
