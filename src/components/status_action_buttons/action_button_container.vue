<template>
  <Popover
    trigger="hover"
    placement="right"
    v-if="button.dropdown?.()"
  >
    <template #trigger>
      {{ props }}
      <ActionButton
        :button="button"
        v-bind="$attrs"
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
            @click="() => {}"
          >
            <FAIcon icon="user" fixed-width />
            {{ $t('status.mute_user') }}
          </button>
        </div>
        <div class="menu-item dropdown-item extra-action -icon">
          <button
            class="main-button"
            @click="() => {}"
          >
            <FAIcon icon="folder-tree" fixed-width />
            {{ $t('status.mute_conversation') }}
          </button>
        </div>
        <div class="menu-item dropdown-item extra-action -icon">
          <button
            class="main-button"
            @click="() => {}"
          >
            <FAIcon icon="globe" fixed-width />
            {{ $t('status.mute_domain') }}
          </button>
        </div>
      </div>
    </template>
  </Popover>
  <ActionButton
    v-else
    :button="button"
    v-bind="$attrs"
  />
</template>

<script src="./action_button_container.js"/>
