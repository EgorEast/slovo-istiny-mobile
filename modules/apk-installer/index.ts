import { requireNativeModule } from 'expo-modules-core'

export interface InstallResult {
  status: 'success'
}

interface ApkInstallerNativeModule {
  canRequestPackageInstalls: () => Promise<boolean>
  computeSha256: (fileUri: string) => Promise<string>
  installApk: (apkPath: string) => Promise<InstallResult>
  openInstallPermissionSettings: () => Promise<void>
}

const getNativeModule = (): ApkInstallerNativeModule | null => {
  try {
    return requireNativeModule<ApkInstallerNativeModule>('ApkInstaller')
  } catch {
    return null
  }
}

export const isApkInstallerAvailable = (): boolean => getNativeModule() !== null

export const installApk = (apkPath: string): Promise<InstallResult> => {
  const nativeModule = getNativeModule()
  if (!nativeModule) throw new Error('[apk-installer] Native module is not available')
  return nativeModule.installApk(apkPath)
}

export const canRequestPackageInstalls = (): Promise<boolean> => {
  const nativeModule = getNativeModule()
  if (!nativeModule) return Promise.resolve(true)
  return nativeModule.canRequestPackageInstalls()
}

export const computeSha256 = (fileUri: string): Promise<string> => {
  const nativeModule = getNativeModule()
  if (!nativeModule) throw new Error('[apk-installer] Native module is not available')
  return nativeModule.computeSha256(fileUri)
}

export const openInstallPermissionSettings = (): Promise<void> => {
  const nativeModule = getNativeModule()
  if (!nativeModule) return Promise.resolve()
  return nativeModule.openInstallPermissionSettings()
}
