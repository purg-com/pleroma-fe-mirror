<template>
  <div
    class="frontends-tab"
    :label="$t('admin_dash.tabs.frontends')"
  >
    <div class="setting-item">
      <h2>{{ $t('admin_dash.tabs.frontends') }}</h2>
      <p>{{ $t('admin_dash.frontend.wip_notice') }}</p>
      <ul
        v-if="adminDraft"
        class="setting-list"
      >
        <li>
          <h3>{{ $t('admin_dash.frontend.default_frontend') }}</h3>
          <p>{{ $t('admin_dash.frontend.default_frontend_tip') }}</p>
          <ul class="setting-list">
            <li>
              <StringSetting path=":pleroma.:frontends.:primary.name" />
            </li>
            <li>
              <StringSetting path=":pleroma.:frontends.:primary.ref" />
            </li>
            <li>
              <GroupSetting path=":pleroma.:frontends.:primary" />
            </li>
          </ul>
        </li>
      </ul>
      <div
        v-else
        class="setting-list"
      >
        {{ $t('admin_dash.frontend.default_frontend_unavail') }}
      </div>

      <div class="setting-list relative">
        <PanelLoading
          v-if="working"
          class="overlay"
        />
        <h3>{{ $t('admin_dash.frontend.available_frontends') }}</h3>
        <ul class="cards-list">
          <li
            v-for="frontend in frontends"
            :key="frontend.name"
          >
            <strong>{{ frontend.name }}</strong>
            {{ ' ' }}
            <span v-if="adminDraft && adminDraft[':pleroma'][':frontends'][':primary']?.name === frontend.name">
              <i18n-t
                v-if="adminDraft && adminDraft[':pleroma'][':frontends'][':primary']?.ref === frontend.refs[0]"
                scope="global"
                keypath="admin_dash.frontend.is_default"
              />
              <i18n-t
                v-else
                keypath="admin_dash.frontend.is_default_custom"
                scope="global"
              >
                <template #version>
                  <code>{{ adminDraft && adminDraft[':pleroma'][':frontends'][':primary'].ref }}</code>
                </template>
              </i18n-t>
            </span>
            <dl>
              <dt>{{ $t('admin_dash.frontend.repository') }}</dt>
              <dd>
                <a
                  :href="frontend.git"
                  target="_blank"
                >{{ frontend.git }}</a>
              </dd>
              <template v-if="expertLevel">
                <dt>{{ $t('admin_dash.frontend.versions') }}</dt>
                <dd
                  v-for="ref in frontend.refs"
                  :key="ref"
                >
                  <code>{{ ref }}</code>
                </dd>
              </template>
              <dt v-if="expertLevel">
                {{ $t('admin_dash.frontend.build_url') }}
              </dt>
              <dd v-if="expertLevel">
                <a
                  :href="frontend.build_url"
                  target="_blank"
                >{{ frontend.build_url }}</a>
              </dd>
            </dl>
            <div>
              <span class="btn-group">
                <button
                  class="button button-default btn"
                  type="button"
                  @click="update(frontend)"
                >
                  {{
                    frontend.installed
                      ? $t('admin_dash.frontend.reinstall')
                      : $t('admin_dash.frontend.install')
                  }}
                  <code>
                    {{
                      getSuggestedRef(frontend)
                    }}
                  </code>
                </button>
                <Popover
                  v-if="frontend.refs.length > 1"
                  trigger="click"
                  class="button-dropdown"
                  placement="bottom"
                >
                  <template #content="{close}">
                    <div class="dropdown-menu">
                      <div
                        v-for="ref in frontend.refs"
                        :key="ref"
                        class="menu-item dropdown-item"
                      >
                        <button
                          class="main-button"
                          @click.prevent="update(frontend, ref)"
                          @click="close"
                        >
                          <span>
                            <i18n-t
                              keypath="admin_dash.frontend.install_version"
                              scope="global"
                            >
                              <template #version>
                                <code>{{ ref }}</code>
                              </template>
                            </i18n-t>
                          </span>
                        </button>
                      </div>
                    </div>
                  </template>
                  <template #trigger>
                    <button
                      class="button button-default btn dropdown-button"
                      type="button"
                      :title="$t('admin_dash.frontend.more_install_options')"
                    >
                      <FAIcon icon="chevron-down" />
                    </button>
                  </template>
                </Popover>
              </span>
              <span
                v-if="frontend.installed && frontend.name !== 'admin-fe'"
                class="btn-group"
              >
                <button
                  class="button button-default btn"
                  type="button"
                  :disabled="
                    !adminDraft || adminDraft[':pleroma'][':frontends'][':primary']?.name === frontend.name &&
                      adminDraft[':pleroma'][':frontends'][':primary']?.ref === frontend.refs[0]
                  "
                  @click="setDefault(frontend)"
                >
                  {{
                    $t('admin_dash.frontend.set_default')
                  }}
                  <code>
                    {{
                      getSuggestedRef(frontend)
                    }}
                  </code>
                </button>
                {{ ' ' }}
                <Popover
                  v-if="frontend.refs.length > 1"
                  trigger="click"
                  class="button-dropdown"
                  placement="bottom"
                >
                  <template #content="{close}">
                    <div class="dropdown-menu">
                      <div
                        v-for="ref in frontend.installedRefs || frontend.refs"
                        :key="ref"
                        class="menu-item dropdown-item"
                      >
                        <button
                          class="main-button"
                          @click.prevent="setDefault(frontend, ref)"
                          @click="close"
                        >
                          <span>
                            <i18n-t
                              keypath="admin_dash.frontend.set_default_version"
                              scope="global"
                            >
                              <template #version>
                                <code>{{ ref }}</code>
                              </template>
                            </i18n-t>
                          </span>
                        </button>
                      </div>
                    </div>
                  </template>
                  <template #trigger>
                    <button
                      class="button button-default btn dropdown-button"
                      type="button"
                      :title="$t('admin_dash.frontend.more_default_options')"
                    >
                      <FAIcon icon="chevron-down" />
                    </button>
                  </template>
                </Popover>
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="./frontends_tab.js"></script>

<style lang="scss" src="./frontends_tab.scss"></style>
