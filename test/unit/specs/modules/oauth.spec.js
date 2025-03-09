import { createStore } from 'vuex'
import { http, HttpResponse } from 'msw'
import oauth from 'src/modules/oauth.js'
import { injectMswToTest, authApis, testServer } from '/test/fixtures/mock_api.js'

const test = injectMswToTest(authApis)

const getStore = (defaultStateInjection) => {
  const stateFunction = defaultStateInjection ? () => {
    return {
      ...oauth.state(),
      ...defaultStateInjection
    }
  } : oauth.state

  return createStore({
    modules: {
      instance: {
        state: () => ({ server: testServer })
      },
      oauth: {
        ...oauth,
        state: stateFunction
      }
    }
  })
}


describe('createApp', () => {
  test('it should use create an app and record client id and secret', async () => {
    const store = getStore()
    const app = await store.dispatch('createApp')
    expect(store.state.oauth.clientId).to.eql('test-id')
    expect(store.state.oauth.clientSecret).to.eql('test-secret')
    expect(app.clientId).to.eql('test-id')
    expect(app.clientSecret).to.eql('test-secret')
  })

  test('it should throw and not update if failed', async ({ worker }) => {
    worker.use(
      http.post(`${testServer}/api/v1/apps`, () => {
        return HttpResponse.text('Throttled', { status: 429 })
      })
    )

    const store = getStore()
    const res = store.dispatch('createApp')
    await expect(res).rejects.toThrowError('Throttled')
    expect(store.state.oauth.clientId).to.eql(false)
    expect(store.state.oauth.clientSecret).to.eql(false)
  })
})

describe('ensureApp', () => {
  test('it should create an app if it does not exist', async () => {
    const store = getStore()
    const app = await store.dispatch('ensureApp')
    expect(store.state.oauth.clientId).to.eql('test-id')
    expect(store.state.oauth.clientSecret).to.eql('test-secret')
    expect(app.clientId).to.eql('test-id')
    expect(app.clientSecret).to.eql('test-secret')
  })

  test('it should not create an app if it exists', async ({ worker }) => {
    worker.use(
      http.post(`${testServer}/api/v1/apps`, () => {
        return HttpResponse.text('Should not call this API', { status: 400 })
      })
    )

    const store = getStore({
      clientId: 'another-id',
      clientSecret: 'another-secret'
    })
    const app = await store.dispatch('ensureApp')
    expect(store.state.oauth.clientId).to.eql('another-id')
    expect(store.state.oauth.clientSecret).to.eql('another-secret')
    expect(app.clientId).to.eql('another-id')
    expect(app.clientSecret).to.eql('another-secret')
  })
})

describe('getAppToken', () => {
  test('it should get app token and set it in state', async () => {
    const store = getStore({
      clientId: 'test-id',
      clientSecret: 'test-secret'
    })
    const token = await store.dispatch('getAppToken')
    expect(token).to.eql('test-app-token')
    expect(store.state.oauth.appToken).to.eql('test-app-token')
  })

  test('it should throw and not set state if it cannot get app token', async () => {
    const store = getStore({
      clientId: 'bad-id',
      clientSecret: 'bad-secret'
    })
    await expect(store.dispatch('getAppToken')).rejects.toThrowError('400')
    expect(store.state.oauth.appToken).to.eql(false)
  })
})

describe('ensureAppToken', () => {
  test('it should work if the state is empty', async () => {
    const store = getStore()
    const token = await store.dispatch('ensureAppToken')
    expect(token).to.eql('test-app-token')
    expect(store.state.oauth.appToken).to.eql('test-app-token')
  })

  test('it should work if we already have a working token', async () => {
    const store = getStore({
      appToken: 'also-good-app-token'
    })
    const token = await store.dispatch('ensureAppToken')
    expect(token).to.eql('also-good-app-token')
    expect(store.state.oauth.appToken).to.eql('also-good-app-token')
  })

  test('it should work if we have a bad token but good app credentials', async ({ worker }) => {
    worker.use(
      http.post(`${testServer}/api/v1/apps`, () => {
        return HttpResponse.text('Should not call this API', { status: 400 })
      })
    )
    const store = getStore({
      appToken: 'bad-app-token',
      clientId: 'test-id',
      clientSecret: 'test-secret'
    })
    const token = await store.dispatch('ensureAppToken')
    expect(token).to.eql('test-app-token')
    expect(store.state.oauth.appToken).to.eql('test-app-token')
  })

  test('it should work if we have no token but good app credentials', async ({ worker }) => {
    worker.use(
      http.post(`${testServer}/api/v1/apps`, () => {
        return HttpResponse.text('Should not call this API', { status: 400 })
      })
    )
    const store = getStore({
      clientId: 'test-id',
      clientSecret: 'test-secret'
    })
    const token = await store.dispatch('ensureAppToken')
    expect(token).to.eql('test-app-token')
    expect(store.state.oauth.appToken).to.eql('test-app-token')
  })

  test('it should work if we have no token and bad app credentials', async () => {
    const store = getStore({
      clientId: 'bad-id',
      clientSecret: 'bad-secret'
    })
    const token = await store.dispatch('ensureAppToken')
    expect(token).to.eql('test-app-token')
    expect(store.state.oauth.appToken).to.eql('test-app-token')
    expect(store.state.oauth.clientId).to.eql('test-id')
    expect(store.state.oauth.clientSecret).to.eql('test-secret')
  })

  test('it should work if we have bad token and bad app credentials', async () => {
    const store = getStore({
      appToken: 'bad-app-token',
      clientId: 'bad-id',
      clientSecret: 'bad-secret'
    })
    const token = await store.dispatch('ensureAppToken')
    expect(token).to.eql('test-app-token')
    expect(store.state.oauth.appToken).to.eql('test-app-token')
    expect(store.state.oauth.clientId).to.eql('test-id')
    expect(store.state.oauth.clientSecret).to.eql('test-secret')
  })

  test('it should throw if we cannot create an app', async ({ worker }) => {
    worker.use(
      http.post(`${testServer}/api/v1/apps`, () => {
        return HttpResponse.text('Throttled', { status: 429 })
      })
    )

    const store = getStore()
    await expect(store.dispatch('ensureAppToken')).rejects.toThrowError('Throttled')
  })

  test('it should throw if we cannot obtain app token', async ({ worker }) => {
    worker.use(
      http.post(`${testServer}/oauth/token`, () => {
        return HttpResponse.text('Throttled', { status: 429 })
      })
    )

    const store = getStore()
    await expect(store.dispatch('ensureAppToken')).rejects.toThrowError('Throttled')
  })
})
