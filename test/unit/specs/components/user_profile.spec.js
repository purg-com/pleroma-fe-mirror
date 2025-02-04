import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import UserProfile from 'src/components/user_profile/user_profile.vue'
import backendInteractorService from 'src/services/backend_interactor_service/backend_interactor_service.js'
import { getters } from 'src/modules/users.js'

const mutations = {
  clearTimeline: () => {}
}

const actions = {
  fetchUser: () => {},
  fetchUserByScreenName: () => {}
}

const testGetters = {
  findUser: state => getters.findUser(state.users),
  findUserByName: state => getters.findUserByName(state.users),
  relationship: state => getters.relationship(state.users),
  mergedConfig: () => ({
    colors: '',
    highlight: {},
    customTheme: {
      colors: []
    }
  })
}

const localUser = {
  id: 100,
  is_local: true,
  screen_name: 'testUser',
  screen_name_ui: 'testUser'
}

const extUser = {
  id: 100,
  is_local: false,
  screen_name: 'testUser@test.instance',
  screen_name_ui: 'testUser@test.instance'
}

const externalProfileStore = createStore({
  mutations,
  actions,
  getters: testGetters,
  state: {
    api: {
      fetchers: {},
      backendInteractor: backendInteractorService('')
    },
    interface: {
      browserSupport: ''
    },
    instance: {
      hideUserStats: true
    },
    statuses: {
      timelines: {
        user: {
          statuses: [],
          statusesObject: {},
          faves: [],
          visibleStatuses: [],
          visibleStatusesObject: {},
          newStatusCount: 0,
          maxId: 0,
          minVisibleId: 0,
          loading: false,
          followers: [],
          friends: [],
          viewing: 'statuses',
          userId: 100,
          flushMarker: 0
        },
        media: {
          statuses: [],
          statusesObject: {},
          faves: [],
          visibleStatuses: [],
          visibleStatusesObject: {},
          newStatusCount: 0,
          maxId: 0,
          minVisibleId: 0,
          loading: false,
          followers: [],
          friends: [],
          viewing: 'statuses',
          userId: 100,
          flushMarker: 0
        }
      }
    },
    users: {
      currentUser: {
        credentials: ''
      },
      usersObject: { 100: extUser },
      usersByNameObject: {},
      users: [extUser],
      relationships: {}
    }
  }
})

const localProfileStore = createStore({
  mutations,
  actions,
  getters: testGetters,
  state: {
    api: {
      fetchers: {},
      backendInteractor: backendInteractorService('')
    },
    interface: {
      browserSupport: ''
    },
    config: {
      colors: '',
      highlight: {},
      customTheme: {
        colors: []
      }
    },
    instance: {
      hideUserStats: true
    },
    statuses: {
      timelines: {
        user: {
          statuses: [],
          statusesObject: {},
          faves: [],
          visibleStatuses: [],
          visibleStatusesObject: {},
          newStatusCount: 0,
          maxId: 0,
          minVisibleId: 0,
          loading: false,
          followers: [],
          friends: [],
          viewing: 'statuses',
          userId: 100,
          flushMarker: 0
        },
        media: {
          statuses: [],
          statusesObject: {},
          faves: [],
          visibleStatuses: [],
          visibleStatusesObject: {},
          newStatusCount: 0,
          maxId: 0,
          minVisibleId: 0,
          loading: false,
          followers: [],
          friends: [],
          viewing: 'statuses',
          userId: 100,
          flushMarker: 0
        }
      }
    },
    users: {
      currentUser: {
        credentials: ''
      },
      usersObject: { 100: localUser },
      usersByNameObject: { testuser: localUser },
      users: [localUser],
      relationships: {}
    }
  }
})

// https://github.com/vuejs/test-utils/issues/1382
describe.skip('UserProfile', () => {
  it('renders external profile', () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [externalProfileStore],
        mocks: {
          $route: {
            params: { id: 100 },
            name: 'external-user-profile'
          },
          $t: (msg) => msg
        }
      }
    })

    expect(wrapper.find('.user-screen-name').text()).to.eql('@testUser@test.instance')
  })

  it('renders local profile', () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [localProfileStore],
        mocks: {
          $route: {
            params: { name: 'testUser' },
            name: 'user-profile'
          },
          $t: (msg) => msg
        }
      }
    })

    expect(wrapper.find('.user-screen-name').text()).to.eql('@testUser')
  })
})
