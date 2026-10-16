import AsyncStorage from '@react-native-async-storage/async-storage'
import { readScalars } from './readScalars'

jest.mock('entities/player', () => {
  const audioSettings = jest.requireActual('entities/player/audio-settings')
  const playbackRate = jest.requireActual('entities/player/playback-rate')
  const playerModel = jest.requireActual('entities/player/model')

  return {
    balanceSchema: audioSettings.balanceSchema,
    equalizerGainsSchema: audioSettings.equalizerGainsSchema,
    pitchSchema: audioSettings.pitchSchema,
    playbackRateSchema: playbackRate.playbackRateSchema,
    repeatModeSchema: playerModel.repeatModeSchema,
  }
})

const TOURS_DISABLED_KEY = 'tours_disabled'
const TOURS_SEEN_VERSION_KEY = 'tours_seen_version'

describe('readScalars (tours settings)', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
  })

  test('includes tours_disabled and tours_seen_version when their keys are present', async () => {
    await AsyncStorage.setItem(TOURS_DISABLED_KEY, 'true')
    await AsyncStorage.setItem(TOURS_SEEN_VERSION_KEY, '1.2.3')

    const { settings } = await readScalars()

    expect(settings?.toursDisabled).toBe(true)
    expect(settings?.toursSeenVersion).toBe('1.2.3')
  })

  test('omits tours settings when their keys are absent', async () => {
    const { settings } = await readScalars()

    expect(settings?.toursDisabled).toBeUndefined()
    expect(settings?.toursSeenVersion).toBeUndefined()
  })
})
