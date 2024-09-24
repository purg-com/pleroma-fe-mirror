<template>
  <div id="app-loaded" v-if="currentUser" class="settings-modal">
    <SettingsModalAdminContent />
  </div>
</template>

<script src="./AppAdmin.js"></script>
<style lang="scss" src="./App.scss"></style>
<style lang="scss" src="src/components/settings_modal/settings_modal.scss"></style>
<style lang="scss" src="./AppAdmin.scss"></style>
