<template>
  <div class="settings panel panel-default">
    <div class="panel-heading">
      <h1 class="title">
        {{ $t('password_reset.password_reset') }}
      </h1>
    </div>
    <div class="panel-body">
      <form
        class="password-reset-form"
        @submit.prevent="submit"
      >
        <div class="container">
          <div v-if="!mailerEnabled">
            <p v-if="passwordResetRequested">
              {{ $t('password_reset.password_reset_required_but_mailer_is_disabled') }}
            </p>
            <p v-else>
              {{ $t('password_reset.password_reset_disabled') }}
            </p>
          </div>
          <div v-else-if="success || throttled">
            <p v-if="success">
              {{ $t('password_reset.check_email') }}
            </p>
            <div class="form-group text-center">
              <router-link :to="{name: 'root'}">
                {{ $t('password_reset.return_home') }}
              </router-link>
            </div>
          </div>
          <div v-else>
            <p
              v-if="passwordResetRequested"
              class="alert password-reset-required error"
            >
              {{ $t('password_reset.password_reset_required') }}
            </p>
            <p>
              {{ $t('password_reset.instruction') }}
            </p>
            <div class="form-group">
              <input
                ref="email"
                v-model="user.email"
                :disabled="isPending"
                :placeholder="$t('password_reset.placeholder')"
                class="input form-control"
                type="input"
              >
            </div>
            <div class="form-group">
              <button
                :disabled="isPending"
                type="submit"
                class="btn button-default btn-block"
              >
                {{ $t('settings.save') }}
              </button>
            </div>
          </div>
          <p
            v-if="error"
            class="alert error notice-dismissible"
          >
            <span>{{ error }}</span>
            <a
              class="fa-scale-110 fa-old-padding dismiss"
              @click.prevent="dismissError()"
            >
              <FAIcon icon="times" />
            </a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script src="./password_reset.js"></script>
<style lang="scss">
.password-reset-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.6em;

  .container {
    display: flex;
    flex: 1 0;
    flex-direction: column;
    margin-top: 0.6em;
    max-width: 18rem;

    > * {
      min-width: 0;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;
    padding: 0.3em 0;
    line-height: 1.85em;
  }

  .error {
    text-align: center;
    animation-name: shakeError;
    animation-duration: 0.4s;
    animation-timing-function: ease-in-out;
  }

  .alert {
    padding: 0.5em;
    margin: 0.3em 0 1em;
  }

  .notice-dismissible {
    padding-right: 2rem;
  }

  .dismiss {
    cursor: pointer;
  }
}

</style>
