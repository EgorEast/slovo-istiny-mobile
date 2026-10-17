import { type AudioPlayer } from 'expo-audio'
import { AppState, type AppStateStatus } from 'react-native'
import { getLocalAppIconUri } from 'shared/lib/app-icon'
import { lockScreenControls } from './LockScreenControls'

const mockIsExpoGo = { isExpoGo: false }

jest.mock('expo-audio', () => ({}))

jest.mock('shared/lib/isExpoEnvironment', () => ({
  get isExpoGo() {
    return mockIsExpoGo.isExpoGo
  },
}))

jest.mock('shared/lib/app-icon', () => ({
  ...jest.requireActual('shared/lib/app-icon'),
  getLocalAppIconUri: jest.fn(),
  // These suites never exercise icon follow-up: keep the real download pending.
  whenAppIconReady: jest.fn(() => new Promise<null>(() => undefined)),
}))

const mockedGetLocalAppIconUri = jest.mocked(getLocalAppIconUri)

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

const metadataStub = { title: 'Проповедь' }
const NEXT_TRACK_METADATA = { title: 'Вторая проповедь' }

let appStateListeners: Array<(state: AppStateStatus) => void> = []

const emitAppState = (state: AppStateStatus) => {
  appStateListeners.forEach(listener => listener(state))
}

describe('LockScreenControls foreground deferral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsExpoGo.isExpoGo = false
    mockedGetLocalAppIconUri.mockReturnValue(null)
    appStateListeners = []
    AppState.currentState = 'active'

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      appStateListeners.push(listener)

      return {
        remove: jest.fn(() => {
          const index = appStateListeners.indexOf(listener)
          if (index !== -1) appStateListeners.splice(index, 1)
        }),
      }
    })

    lockScreenControls.clear(null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('activates immediately when the app is already in the foreground', () => {
    const { player, setActiveForLockScreen } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)

    expect(setActiveForLockScreen).toHaveBeenCalledWith(true, metadataStub, expect.any(Object))
  })

  test('defers activation while backgrounded and activates on the next foreground', () => {
    AppState.currentState = 'background'
    const { player, setActiveForLockScreen } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)
    expect(setActiveForLockScreen).not.toHaveBeenCalled()

    AppState.currentState = 'active'
    emitAppState('active')

    expect(setActiveForLockScreen).toHaveBeenCalledWith(true, metadataStub, expect.any(Object))
  })

  test('drops a pending activation when the player is cleared before the foreground', () => {
    AppState.currentState = 'background'
    const { player, setActiveForLockScreen } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)
    lockScreenControls.clear(player)

    setActiveForLockScreen.mockClear()
    AppState.currentState = 'active'
    emitAppState('active')

    expect(setActiveForLockScreen).not.toHaveBeenCalled()
  })

  test('updates metadata in place for the same player without re-activating', () => {
    const { player, setActiveForLockScreen, updateLockScreenMetadata } = createPlayer()

    lockScreenControls.setMetadata(player, metadataStub)
    lockScreenControls.setMetadata(player, NEXT_TRACK_METADATA)

    expect(updateLockScreenMetadata).toHaveBeenCalledWith(NEXT_TRACK_METADATA)
    expect(setActiveForLockScreen).toHaveBeenCalledTimes(1)
  })
})
