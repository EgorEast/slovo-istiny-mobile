import { type AudioPlayer } from 'expo-audio'
import { AppState } from 'react-native'
import { getLocalAppIconUri, whenAppIconReady } from 'shared/lib/app-icon'
import { lockScreenControls } from './LockScreenControls'

const mockIsExpoGo = { isExpoGo: false }

jest.mock('expo-audio', () => ({}))
jest.mock('shared/lib/isExpoEnvironment', () => ({
  get isExpoGo() {
    return mockIsExpoGo.isExpoGo
  },
}))
jest.mock('shared/lib/app-icon', () => ({
  getLocalAppIconUri: jest.fn(),
  hasUriProtocol: (value: null | string | undefined) =>
    !!value && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value),
  whenAppIconReady: jest.fn(),
}))

const mockedGetLocalAppIconUri = jest.mocked(getLocalAppIconUri)
const mockedWhenAppIconReady = jest.mocked(whenAppIconReady)

const createDeferred = () => {
  let resolve: (value: null | string) => void = () => undefined
  const promise = new Promise<null | string>(res => {
    resolve = res
  })

  return { promise, resolve: (value: null | string): void => resolve(value) }
}

const createPlayer = () => {
  const setActiveForLockScreen = jest.fn()
  const updateLockScreenMetadata = jest.fn()
  const player = {
    isLoaded: true,
    setActiveForLockScreen,
    updateLockScreenMetadata,
  } as unknown as AudioPlayer

  return { player, setActiveForLockScreen, updateLockScreenMetadata }
}

const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

const LOCAL_ICON_URI = 'file:///cache/icon.png'
const metadataStub = { title: 'Проповедь' }

describe('LockScreenControls icon follow-up', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsExpoGo.isExpoGo = false
    AppState.currentState = 'active'
    mockedGetLocalAppIconUri.mockReturnValue(null)
    lockScreenControls.clear(null)
  })

  test('re-applies the same metadata once the fallback icon resolves', async () => {
    const deferred = createDeferred()
    mockedWhenAppIconReady.mockReturnValue(deferred.promise)
    const { player, setActiveForLockScreen, updateLockScreenMetadata } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)
    expect(setActiveForLockScreen).toHaveBeenCalledTimes(1)

    mockedGetLocalAppIconUri.mockReturnValue(LOCAL_ICON_URI)
    deferred.resolve(LOCAL_ICON_URI)
    await flushMicrotasks()

    expect(updateLockScreenMetadata).toHaveBeenCalledTimes(1)
    expect(updateLockScreenMetadata).toHaveBeenCalledWith({
      ...metadataStub,
      artworkUrl: LOCAL_ICON_URI,
    })
    // The re-apply goes through the in-place path, not a second activation.
    expect(setActiveForLockScreen).toHaveBeenCalledTimes(1)
  })

  test('does not re-apply when the icon download resolves null', async () => {
    const deferred = createDeferred()
    mockedWhenAppIconReady.mockReturnValue(deferred.promise)
    const { player, updateLockScreenMetadata } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)

    deferred.resolve(null)
    await flushMicrotasks()

    expect(updateLockScreenMetadata).not.toHaveBeenCalled()
  })

  test('does not subscribe when the metadata already has artwork', async () => {
    const { player, updateLockScreenMetadata } = createPlayer()

    lockScreenControls.setMetadata(player, {
      ...metadataStub,
      artworkUrl: 'https://example.com/cover.jpg',
    })
    await flushMicrotasks()

    expect(mockedWhenAppIconReady).not.toHaveBeenCalled()
    expect(updateLockScreenMetadata).not.toHaveBeenCalled()
  })

  test('does not re-apply when cleared before the icon resolves', async () => {
    const deferred = createDeferred()
    mockedWhenAppIconReady.mockReturnValue(deferred.promise)
    const { player, updateLockScreenMetadata } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)
    lockScreenControls.clear(player)

    mockedGetLocalAppIconUri.mockReturnValue(LOCAL_ICON_URI)
    deferred.resolve(LOCAL_ICON_URI)
    await flushMicrotasks()

    expect(updateLockScreenMetadata).not.toHaveBeenCalled()
  })

  test('re-applies the latest payload when the track switched before the icon resolves', async () => {
    const deferred = createDeferred()
    mockedWhenAppIconReady.mockReturnValue(deferred.promise)
    const { player, updateLockScreenMetadata } = createPlayer()
    const firstMetadata = { title: 'Первая' }
    const secondMetadata = { title: 'Вторая' }

    lockScreenControls.setMetadata(player, firstMetadata)
    lockScreenControls.setMetadata(player, secondMetadata)

    mockedGetLocalAppIconUri.mockReturnValue(LOCAL_ICON_URI)
    deferred.resolve(LOCAL_ICON_URI)
    await flushMicrotasks()

    expect(updateLockScreenMetadata).toHaveBeenCalledWith({
      ...secondMetadata,
      artworkUrl: LOCAL_ICON_URI,
    })
    expect(updateLockScreenMetadata).not.toHaveBeenCalledWith({
      ...firstMetadata,
      artworkUrl: LOCAL_ICON_URI,
    })
  })

  test('arms the follow-up for a protocol-less artwork url', async () => {
    const deferred = createDeferred()
    mockedWhenAppIconReady.mockReturnValue(deferred.promise)
    const { player, updateLockScreenMetadata } = createPlayer()

    lockScreenControls.setMetadata(player, {
      ...metadataStub,
      artworkUrl: 'assets_fallbackartwork',
    })
    expect(mockedWhenAppIconReady).toHaveBeenCalledTimes(1)

    mockedGetLocalAppIconUri.mockReturnValue(LOCAL_ICON_URI)
    deferred.resolve(LOCAL_ICON_URI)
    await flushMicrotasks()

    expect(updateLockScreenMetadata).toHaveBeenCalledWith({
      ...metadataStub,
      artworkUrl: LOCAL_ICON_URI,
    })
  })
})
