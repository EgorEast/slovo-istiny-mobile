import { createCtx, type Ctx } from '@reatom/framework'
import { setSermonCachingEnabled } from 'entities/offline-cache'
import {
  applyRepeatMode,
  setBalanceAction,
  setEqEnabledAction,
  setEqGainsAction,
  setPitchAction,
  setPlaybackRateAction,
  setRepeatModeAction,
} from 'entities/player'
import {
  persistImportSettings,
  readImportSettings,
  setHapticsEnabled,
  setServerUrlAction,
  setToursDisabled,
  setToursSeenVersion,
} from 'shared/model'
import { setDynamicColors, setThemeMode } from 'shared/ui/theme'
import { applyPlayerScalars, applySettingsScalars, applyYouTubeImport } from './applyBackupScalars'

jest.mock('entities/player', () => ({
  applyRepeatMode: jest.fn(),
  setBalanceAction: jest.fn(),
  setEqEnabledAction: jest.fn(),
  setEqGainsAction: jest.fn(),
  setPitchAction: jest.fn(),
  setPlaybackRateAction: jest.fn(),
  setRepeatModeAction: jest.fn(),
}))

jest.mock('entities/offline-cache', () => ({
  setSermonCachingEnabled: jest.fn(),
}))

// Схему берём настоящую (merge валидируется ею), а экшены и владельческие read/persist — мокаем.
jest.mock('shared/model', () => ({
  ...jest.requireActual('shared/model'),
  persistImportSettings: jest.fn(),
  readImportSettings: jest.fn(),
  setHapticsEnabled: jest.fn(),
  setServerUrlAction: jest.fn(),
  setToursDisabled: jest.fn(),
  setToursSeenVersion: jest.fn(),
}))

jest.mock('shared/ui/theme', () => ({
  setDynamicColors: jest.fn(),
  setThemeMode: jest.fn(),
}))

const ctx: Ctx = createCtx()

const OLD_URL = 'https://old.example.com'
const NEW_URL = 'https://new.example.com'
const INVIDIOUS = 'invidious' as const

describe('applySettingsScalars', () => {
  beforeEach(() => jest.clearAllMocks())

  test('applies every present field through its owner action', async () => {
    await applySettingsScalars(ctx, {
      dynamicColors: true,
      hapticsEnabled: false,
      sermonCachingEnabled: true,
      serverUrl: 'https://api.example.com',
      themeMode: 'dark',
      toursDisabled: true,
      toursSeenVersion: '1.2.0',
    })

    expect(setThemeMode).toHaveBeenCalledWith(ctx, 'dark')
    expect(setDynamicColors).toHaveBeenCalledWith(ctx, true)
    expect(setHapticsEnabled).toHaveBeenCalledWith(ctx, false)
    expect(setServerUrlAction).toHaveBeenCalledWith(ctx, 'https://api.example.com')
    expect(setSermonCachingEnabled).toHaveBeenCalledWith(ctx, true)
    expect(setToursDisabled).toHaveBeenCalledWith(ctx, true)
    expect(setToursSeenVersion).toHaveBeenCalledWith(ctx, '1.2.0')
  })

  test('skips fields absent from the file', async () => {
    await applySettingsScalars(ctx, { themeMode: 'light' })

    expect(setThemeMode).toHaveBeenCalledWith(ctx, 'light')
    expect(setDynamicColors).not.toHaveBeenCalled()
    expect(setHapticsEnabled).not.toHaveBeenCalled()
    expect(setServerUrlAction).not.toHaveBeenCalled()
    expect(setSermonCachingEnabled).not.toHaveBeenCalled()
    expect(setToursDisabled).not.toHaveBeenCalled()
    expect(setToursSeenVersion).not.toHaveBeenCalled()
  })

  test('does nothing without settings', async () => {
    await applySettingsScalars(ctx, undefined)

    expect(setThemeMode).not.toHaveBeenCalled()
  })
})

describe('applyPlayerScalars', () => {
  beforeEach(() => jest.clearAllMocks())

  test('applies every present player field', async () => {
    await applyPlayerScalars(ctx, {
      balance: -0.5,
      equalizerEnabled: true,
      equalizerGains: [1, 2, 3, 4, 5],
      pitch: 1.5,
      playbackRate: 1.25,
      repeatMode: 'queue',
    })

    expect(setPlaybackRateAction).toHaveBeenCalledWith(ctx, 1.25)
    expect(setRepeatModeAction).toHaveBeenCalledWith(ctx, 'queue')
    expect(applyRepeatMode).toHaveBeenCalledWith('queue')
    expect(setBalanceAction).toHaveBeenCalledWith(ctx, -0.5)
    expect(setPitchAction).toHaveBeenCalledWith(ctx, 1.5)
    expect(setEqEnabledAction).toHaveBeenCalledWith(ctx, true)
    expect(setEqGainsAction).toHaveBeenCalledWith(ctx, [1, 2, 3, 4, 5])
  })

  test('skips fields absent from the file', async () => {
    await applyPlayerScalars(ctx, { repeatMode: 'track' })

    expect(setRepeatModeAction).toHaveBeenCalledWith(ctx, 'track')
    expect(applyRepeatMode).toHaveBeenCalledWith('track')
    expect(setPlaybackRateAction).not.toHaveBeenCalled()
    expect(setBalanceAction).not.toHaveBeenCalled()
    expect(setEqGainsAction).not.toHaveBeenCalled()
  })
})

describe('applyYouTubeImport', () => {
  const mockReadImportSettings = jest.mocked(readImportSettings)
  const mockPersistImportSettings = jest.mocked(persistImportSettings)

  beforeEach(() => jest.clearAllMocks())

  test('merges partial imported settings with stored ones', async () => {
    mockReadImportSettings.mockResolvedValue({
      invidiousBaseUrl: OLD_URL,
      source: 'youtube',
    })

    await applyYouTubeImport({ source: INVIDIOUS })

    expect(mockPersistImportSettings).toHaveBeenCalledWith({
      invidiousBaseUrl: OLD_URL,
      source: INVIDIOUS,
    })
  })

  test('imported fields win over stored ones', async () => {
    mockReadImportSettings.mockResolvedValue({
      invidiousBaseUrl: OLD_URL,
      source: 'youtube',
    })

    await applyYouTubeImport({
      invidiousBaseUrl: NEW_URL,
      source: INVIDIOUS,
    })

    expect(mockPersistImportSettings).toHaveBeenCalledWith({
      invidiousBaseUrl: NEW_URL,
      source: INVIDIOUS,
    })
  })

  test('strips credentials from an old backup instance url', async () => {
    mockReadImportSettings.mockResolvedValue(undefined)

    await applyYouTubeImport({
      invidiousBaseUrl: 'https://admin:secret@inv.phobos.observer',
      source: INVIDIOUS,
    })

    expect(mockPersistImportSettings).toHaveBeenCalledWith({
      invidiousBaseUrl: 'https://inv.phobos.observer',
      source: INVIDIOUS,
    })
  })

  test('does nothing when the file has no import settings', async () => {
    await applyYouTubeImport(undefined)

    expect(mockPersistImportSettings).not.toHaveBeenCalled()
  })

  test('does not persist an invalid merged result', async () => {
    mockReadImportSettings.mockResolvedValue(undefined)

    await applyYouTubeImport({ source: INVIDIOUS })

    expect(mockPersistImportSettings).not.toHaveBeenCalled()
  })
})
