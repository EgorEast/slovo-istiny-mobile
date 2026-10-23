import { requireNativeModule } from 'expo-modules-core'
import {
  canRequestPackageInstalls,
  computeSha256,
  installApk,
  isApkInstallerAvailable,
  openInstallPermissionSettings,
} from './index'

// Keep every other expo-modules-core export (and its native lookup) intact:
// jest-expo needs requireNativeModule to resolve its own modules (e.g. winter
// fetch) at import time. The wrapper is delegated to the real lookup until a
// test overrides it.
jest.mock('expo-modules-core', () => {
  const actual = jest.requireActual('expo-modules-core')
  return {
    ...actual,
    requireNativeModule: jest.fn(actual.requireNativeModule),
  }
})

const mockedRequireNativeModule = jest.mocked(requireNativeModule)

const APK_PATH = '/cache/update/app.apk'
const NATIVE_UNAVAILABLE_MESSAGE = '[apk-installer] Native module is not available'

const createNativeModule = () => ({
  canRequestPackageInstalls: jest.fn(async () => false),
  computeSha256: jest.fn(async () => 'a'.repeat(64)),
  installApk: jest.fn(async () => ({ status: 'success' as const })),
  openInstallPermissionSettings: jest.fn(async () => {}),
})

const rejectNativeLookup = () =>
  mockedRequireNativeModule.mockImplementation(() => {
    throw new Error('Cannot find native module')
  })

describe('apk-installer JS boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('delegates every call to the native module when it is available', async () => {
    const nativeModule = createNativeModule()
    mockedRequireNativeModule.mockReturnValue(nativeModule)

    expect(isApkInstallerAvailable()).toBe(true)
    await expect(installApk(APK_PATH)).resolves.toEqual({ status: 'success' })
    expect(nativeModule.installApk).toHaveBeenCalledWith(APK_PATH)
    await expect(canRequestPackageInstalls()).resolves.toBe(false)
    expect(nativeModule.canRequestPackageInstalls).toHaveBeenCalledTimes(1)
    await expect(openInstallPermissionSettings()).resolves.toBeUndefined()
    expect(nativeModule.openInstallPermissionSettings).toHaveBeenCalledTimes(1)
    await expect(computeSha256(APK_PATH)).resolves.toBe('a'.repeat(64))
    expect(nativeModule.computeSha256).toHaveBeenCalledWith(APK_PATH)
  })

  test('reports the module as unavailable when the native lookup throws', () => {
    rejectNativeLookup()

    expect(isApkInstallerAvailable()).toBe(false)
  })

  test('assumes install permission is grantable when the module is absent', async () => {
    rejectNativeLookup()

    await expect(canRequestPackageInstalls()).resolves.toBe(true)
  })

  test('treats opening the install settings as a no-op when the module is absent', async () => {
    rejectNativeLookup()

    await expect(openInstallPermissionSettings()).resolves.toBeUndefined()
  })

  test('throws a descriptive error when installing without the module', () => {
    rejectNativeLookup()

    expect(() => installApk(APK_PATH)).toThrow(NATIVE_UNAVAILABLE_MESSAGE)
  })

  test('throws a descriptive error when hashing without the module', () => {
    rejectNativeLookup()

    expect(() => computeSha256(APK_PATH)).toThrow(NATIVE_UNAVAILABLE_MESSAGE)
  })
})
