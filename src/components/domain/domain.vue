<template>
  <div class="domain">
    <div class="heading">
      <h4>{{ $t('admin_dash.domains.title') }}</h4>
    </div>
    <div class="body">
      <span>
        {{ domainName }} ({{ $t(domainState ? 'admin_dash.domains.public' : 'admin_dash.domains.private') }})
      </span>
    </div>
    <div class="footer">
      <div
        v-if="!resolves"
        class="alert error"
      >
        {{ $t('admin_dash.domains.resolve_error') }}
      </div>
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
      <span v-if="lastCheckedAt">
        {{ $t('admin_dash.domains.last_checked_time_display', { time: lastCheckedAt }) }}
      </span>
      <div class="actions">
        <button
          class="btn button-default"
          @click="switchState"
        >
          {{ $t('admin_dash.domains.switch_state_action') }}
        </button>
        <button
          class="btn button-default"
          @click="deleteDomain"
        >
          {{ $t('admin_dash.domains.delete_action') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./domain.js"></script>

<style lang="scss">
@import "../../variables";

.domain {
  border-bottom: 1px solid var(--border, $fallback--border);
  border-radius: 0;
  padding: var(--status-margin, $status-margin);

  .heading,
  .body {
    margin-bottom: var(--status-margin, $status-margin);
  }

  .footer {
    .error {
    margin: 0 0 var(--status-margin, $status-margin);
    }

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;

      .btn {
        flex: 1;
        margin: 1em;
        max-width: 12em;
      }
    }
  }
}
</style>
