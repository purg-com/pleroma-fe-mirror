<template>
  <confirm-modal
    v-if="showing"
    :title="$t('user_card.mute_confirm_title')"
    :confirm-text="$t('user_card.mute_confirm_accept_button')"
    :cancel-text="$t('user_card.mute_confirm_cancel_button')"
    @accepted="doMute"
    @cancelled="hide"
  >
    <i18n-t
      :keypath="keypath"
      tag="div"
    >
      <template #domain>
        <span v-text="domain" />
      </template>
      <template #user>
        <span v-text="user.screen_name_ui" />
      </template>
    </i18n-t>
    <div class="mute-expiry" v-if="type !== 'domain'">
      <p>
        <label>
          {{ $t('user_card.mute_duration_prompt') }}
        </label>
        <input
          v-model="muteExpiryAmount"
          type="number"
          class="input expiry-amount hide-number-spinner"
          :min="0"
        >
        {{ ' ' }}
        <Select
          v-model="muteExpiryUnit"
          unstyled="true"
          class="expiry-unit"
        >
          <option
            v-for="unit in muteExpiryUnits"
            :key="unit"
            :value="unit"
            >
            {{ $t(`time.unit.${unit}_short`, ['']) }}
          </option>
        </Select>
      </p>
    </div>
  </confirm-modal>
</template>

<script src="./mute_confirm.js" />

<style lang="scss">
.expiry-amount {
  width: 4em;
  text-align: right;
}
</style>
