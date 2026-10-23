import { Directory, File, Paths } from 'expo-file-system'

const UPDATES_DIR_NAME = 'updates'

export const getUpdatesDirectory = (): Directory => new Directory(Paths.cache, UPDATES_DIR_NAME)

export const ensureUpdatesDirectoryExists = (): Directory => {
  const updatesDir = getUpdatesDirectory()
  if (!updatesDir.exists) updatesDir.create({ intermediates: true })
  return updatesDir
}

export const apkFileExists = (apkPath: string): boolean => new File(apkPath).exists
