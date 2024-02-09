<template>
  <div
    class="domains-tab"
    :label="$t('admin_dash.tabs.domains')"
  >
    <div class="setting-item">
      <h2>{{ $t('admin_dash.tabs.domains') }}</h2>
      <div class="domain-editor">
        <div class="heading">
          <h4>{{ $t('admin_dash.domains.post_form_header') }}</h4>
        </div>
        <div class="body">
          <span>
            <label for="domain-name">{{ $t('admin_dash.domains.name_prompt') }}</label>
            <input
              id="domain-name"
              v-model="domain.domain"
            >
          </span>
          <span>
            <Checkbox
              id="domain-public"
              v-model="domain.public"
              :disabled="disabled"
            />
            <label for="domain-public">{{ $t('admin_dash.domains.public_prompt') }}</label>
          </span>
        </div>
        <div class="actions">
          <button
            class="btn button-default post-button"
            :disabled="working"
            @click.prevent="submitDomain"
          >
            {{ $t('admin_dash.domains.post_action') }}
          </button>
          <div
            v-if="error"
            class="alert error"
          >
            {{ $t('admin_dash.domains.post_error', { error }) }}
            <button
              class="button-unstyled"
              @click="clearError"
            >
              <FAIcon
                class="fa-scale-110 fa-old-padding"
                icon="times"
                :title="$t('admin_dash.domains.close_error')"
              />
            </button>
          </div>
        </div>
      </div>
      <PanelLoading class="overlay" v-if="working"/>
      <section
        v-for="domain in domains"
        :key="domain.id"
      >
        <Domain
          :domain="domain"
        />
      </section>
    </div>
  </div>
</template>

<script src="./domains_tab.js"></script>

<style lang="scss">
@import "../../../variables";

.domain-editor {
  .body {
    display: flex;
    align-items: stretch;
    flex-direction: column;

    > span {
      margin-top: 0.5em;

      > *:not(:first-child) {
        margin-left: 0.5rem;
      }
    }
  }

  .actions {
    .btn {
      flex: 1;
      margin: 1em;
      max-width: 10em;
    }
  }
}
</style>
