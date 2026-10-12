import AsyncStorage from '@react-native-async-storage/async-storage'
import { createCtx } from '@reatom/framework'
import { featureFlagsApi } from 'shared/api'
import { featureFlagsMocks } from 'shared/api/generated'
import { showToast } from 'shared/model'
import { reportError } from 'shared/model/error-dialog'
import { CACHED_FEATURE_FLAGS } from './lib/flagsCache/cacheKey'
import { hydrateCachedFeatureFlags } from './lib/hydrateCachedFlags'
import { featureFlagsAtom, fetchMyFeatureFlags } from './model'

jest.mock('shared/api', () => ({
  featureFlagsApi: { getFeatureFlags: jest.fn() },
}))

jest.mock('shared/model', () => ({ showToast: jest.fn() }))

jest.mock('shared/model/error-dialog', () => ({ reportError: jest.fn() }))

const mockedShowToast = jest.mocked(showToast)
const mockedReportError = jest.mocked(reportError)
const mockedGetEffectiveForMe = jest.fn()

const NETWORK_ERROR = new Error('network down')

const setFlagsResponse = (flags: Array<{ enabled: boolean; key: string }>) =>
  mockedGetEffectiveForMe.mockResolvedValue(
    featureFlagsMocks.getFeatureFlagsControllerGetEffectiveForMeResponseMock({ flags }),
  )

beforeEach(() => AsyncStorage.clear())

describe('fetchMyFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(featureFlagsApi.getFeatureFlags as jest.Mock).mockReturnValue({
      featureFlagsControllerGetEffectiveForMe: mockedGetEffectiveForMe,
    })
  })

  test('stores global flags when the server returns them (anonymous)', async () => {
    setFlagsResponse([{ enabled: true, key: 'read' }])
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)

    expect(mockedGetEffectiveForMe).toHaveBeenCalledTimes(1)
    expect(mockedShowToast).not.toHaveBeenCalled()
    expect(ctx.get(featureFlagsAtom)).toEqual({ read: true })
  })

  test('stores personalized flags for an authenticated response', async () => {
    setFlagsResponse([
      { enabled: true, key: 'read' },
      { enabled: false, key: 'study' },
    ])
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ read: true, study: false })
  })

  test('keeps flags null and shows a toast instead of the global error on failure', async () => {
    mockedGetEffectiveForMe.mockRejectedValue(NETWORK_ERROR)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toBeNull()
    expect(mockedShowToast).toHaveBeenCalledWith(expect.anything(), expect.any(String))
    expect(mockedReportError).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  test('does not show a second toast while the failure keeps repeating', async () => {
    mockedGetEffectiveForMe.mockRejectedValue(NETWORK_ERROR)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)
    await fetchMyFeatureFlags(ctx)

    expect(mockedShowToast).toHaveBeenCalledTimes(1)
    consoleErrorSpy.mockRestore()
  })

  test('stays silent when a failure follows a recovery (cached fallback present)', async () => {
    mockedGetEffectiveForMe.mockRejectedValue(NETWORK_ERROR)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)
    setFlagsResponse([{ enabled: true, key: 'read' }])
    await fetchMyFeatureFlags(ctx)
    mockedGetEffectiveForMe.mockRejectedValue(NETWORK_ERROR)
    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ read: true })
    expect(mockedShowToast).toHaveBeenCalledTimes(1)
    consoleErrorSpy.mockRestore()
  })

  test('caches the flags map on a successful fetch', async () => {
    setFlagsResponse([{ enabled: true, key: 'read' }])
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ read: true })
    expect(await AsyncStorage.getItem(CACHED_FEATURE_FLAGS)).toBe(JSON.stringify({ read: true }))
  })

  test('skips the cache write when the fetched map matches the current atom value', async () => {
    setFlagsResponse([{ enabled: true, key: 'read' }])
    const ctx = createCtx()
    featureFlagsAtom(ctx, { read: true })

    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ read: true })
    expect(await AsyncStorage.getItem(CACHED_FEATURE_FLAGS)).toBeNull()
  })

  test('writes the cache when the fetched map differs from the current atom value', async () => {
    setFlagsResponse([{ enabled: false, key: 'read' }])
    const ctx = createCtx()
    featureFlagsAtom(ctx, { read: true })

    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ read: false })
    expect(await AsyncStorage.getItem(CACHED_FEATURE_FLAGS)).toBe(JSON.stringify({ read: false }))
  })

  test('shows the fallback message when the fetch fails without cached flags', async () => {
    mockedGetEffectiveForMe.mockRejectedValue(NETWORK_ERROR)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const ctx = createCtx()

    await fetchMyFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toBeNull()
    expect(mockedShowToast).toHaveBeenCalledWith(
      expect.anything(),
      'Не удалось загрузить фича-флаги',
    )
    consoleErrorSpy.mockRestore()
  })

  test('does not show a toast when a cached fallback is already present', async () => {
    mockedGetEffectiveForMe.mockRejectedValue(NETWORK_ERROR)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const ctx = createCtx()
    featureFlagsAtom(ctx, { read: true })

    await fetchMyFeatureFlags(ctx)

    expect(mockedShowToast).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('hydrateCachedFeatureFlags', () => {
  test('commits the cached map into an empty atom', async () => {
    const ctx = createCtx()
    await AsyncStorage.setItem(CACHED_FEATURE_FLAGS, JSON.stringify({ read: true, study: false }))

    await hydrateCachedFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ read: true, study: false })
  })

  test('does not clobber a fresher flag map', async () => {
    const ctx = createCtx()
    await AsyncStorage.setItem(CACHED_FEATURE_FLAGS, JSON.stringify({ read: true }))
    featureFlagsAtom(ctx, { study: true })

    await hydrateCachedFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toEqual({ study: true })
  })

  test('keeps the atom null when the cached JSON is corrupt', async () => {
    const ctx = createCtx()
    await AsyncStorage.setItem(CACHED_FEATURE_FLAGS, '{not json')

    await expect(hydrateCachedFeatureFlags(ctx)).resolves.toBeUndefined()

    expect(ctx.get(featureFlagsAtom)).toBeNull()
  })

  test('skips an empty cached map', async () => {
    const ctx = createCtx()
    await AsyncStorage.setItem(CACHED_FEATURE_FLAGS, '{}')

    await hydrateCachedFeatureFlags(ctx)

    expect(ctx.get(featureFlagsAtom)).toBeNull()
  })
})
