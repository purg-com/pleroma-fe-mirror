<template>
  <div :label="$t('settings.general')">
    <div class="setting-item">
      <h2>{{ $t('settings.interface') }}</h2>
      <ul class="setting-list">
        <li v-if="instanceWallpaperUsed">
          <BooleanSetting path="hideInstanceWallpaper">
            {{ $t('settings.hide_wallpaper') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="disableStickyHeaders">
            {{ $t('settings.disable_sticky_headers') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="showScrollbars">
            {{ $t('settings.show_scrollbars') }}
          </BooleanSetting>
        </li>
        <li>
          <UnitSetting
            path="textSize"
            step="0.1"
            :units="['px', 'rem']"
            :reset-default="{ 'px': 14, 'rem': 1 }"
            timed-apply-mode
          >
            {{ $t('settings.text_size') }}
          </UnitSetting>
          <div>
            <small>
              <i18n-t
                scope="global"
                keypath="settings.text_size_tip"
                tag="span"
              >
                <code>px</code>
                <code>rem</code>
              </i18n-t>
              <br/>
              <i18n-t
                scope="global"
                keypath="settings.text_size_tip2"
                tag="span"
              >
                <code>14px</code>
              </i18n-t>
            </small>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./appearance_tab.js"></script>

<style lang="scss">
.column-settings {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.column-settings .size-label {
  display: block;
  margin-bottom: 0.5em;
  margin-top: 0.5em;
}
</style>
