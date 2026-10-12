import z from 'zod'
import { readImportSettings } from 'features/sermon-audio-import/@x/settings-backup'
import {
  balanceSchema,
  equalizerGainsSchema,
  pitchSchema,
  playbackRateSchema,
  repeatModeSchema,
} from 'entities/player'
import {
  CURRENT_EQUALIZER_ENABLED,
  CURRENT_EQUALIZER_GAINS,
  CURRENT_PLAYBACK_RATE,
  CURRENT_REPEAT_MODE,
  CURRENT_SOUND_BALANCE,
  CURRENT_SOUND_PITCH,
} from 'shared/config'
import { type BackupImportData } from '../model/backupPayload'
import { themeModeBackupSchema } from '../model/backupScalars'
import { readBoolean, readHttpUrl, readJson, readNumber, readString } from './readScalarValues'

// Ключи, объявленные локальными константами у владельцев (theme/settings/
// offline-cache), читаются той же строкой. Владельцы: shared/ui/theme/model.ts,
// shared/model/settings.ts, entities/offline-cache/lib/sermonCachingSetting.ts.
const THEME_MODE_KEY = 'theme_mode'
const DYNAMIC_COLORS_KEY = 'dynamic_colors'
const HAPTICS_ENABLED_KEY = 'haptics_enabled'
const SERVER_URL_KEY = 'server-url'
const SERMON_CACHING_ENABLED_KEY = 'sermon_caching_enabled'
const TOURS_DISABLED_KEY = 'tours_disabled'
const TOURS_SEEN_VERSION_KEY = 'tours_seen_version'

const readSettingsScalars = async (): Promise<BackupImportData['settings']> => {
  const [
    dynamicColors,
    hapticsEnabled,
    sermonCachingEnabled,
    serverUrl,
    themeMode,
    toursDisabled,
    toursSeenVersion,
  ] = await Promise.all([
    readBoolean(DYNAMIC_COLORS_KEY),
    readBoolean(HAPTICS_ENABLED_KEY),
    readBoolean(SERMON_CACHING_ENABLED_KEY),
    readHttpUrl(SERVER_URL_KEY),
    readString(THEME_MODE_KEY, themeModeBackupSchema),
    readBoolean(TOURS_DISABLED_KEY),
    readString(TOURS_SEEN_VERSION_KEY, z.string()),
  ])

  return {
    dynamicColors,
    hapticsEnabled,
    sermonCachingEnabled,
    serverUrl,
    themeMode,
    toursDisabled,
    toursSeenVersion,
  }
}

const readPlayerScalars = async (): Promise<BackupImportData['player']> => {
  const [balance, equalizerEnabled, equalizerGains, pitch, playbackRate, repeatMode] =
    await Promise.all([
      readNumber(CURRENT_SOUND_BALANCE, balanceSchema),
      readBoolean(CURRENT_EQUALIZER_ENABLED),
      readJson(CURRENT_EQUALIZER_GAINS, equalizerGainsSchema),
      readNumber(CURRENT_SOUND_PITCH, pitchSchema),
      readNumber(CURRENT_PLAYBACK_RATE, playbackRateSchema),
      readString(CURRENT_REPEAT_MODE, repeatModeSchema),
    ])

  return { balance, equalizerEnabled, equalizerGains, pitch, playbackRate, repeatMode }
}

const readYouTubeImport = async (): Promise<BackupImportData['youtubeImport']> =>
  readImportSettings()

/** Читает скалярные настройки (приложение, плеер, импорт аудио) из AsyncStorage. */
export const readScalars = async (): Promise<{
  player: BackupImportData['player']
  settings: BackupImportData['settings']
  youtubeImport: BackupImportData['youtubeImport']
}> => {
  const [settings, player, youtubeImport] = await Promise.all([
    readSettingsScalars(),
    readPlayerScalars(),
    readYouTubeImport(),
  ])

  return { player, settings, youtubeImport }
}
