import { type Ctx } from '@reatom/framework'
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
import { splitBasicAuthUrl } from 'shared/lib/basicAuthUrl'
import {
  importSettingsSchema,
  persistImportSettings,
  readImportSettings,
  setHapticsEnabled,
  setServerUrlAction,
  setToursDisabled,
  setToursSeenVersion,
} from 'shared/model'
import { setDynamicColors, setThemeMode } from 'shared/ui/theme'
import { type BackupImportData } from '../model/backupPayload'

/**
 * Применяет скалярные настройки приложения — только присутствующие в файле поля.
 * @param ctx - Reatom-контекст экшена.
 * @param settings - Настройки приложения из файла (или отсутствуют).
 */
export const applySettingsScalars = async (
  ctx: Ctx,
  settings: BackupImportData['settings'],
): Promise<void> => {
  if (!settings) return

  if (settings.themeMode) await setThemeMode(ctx, settings.themeMode)
  if (settings.dynamicColors !== undefined) await setDynamicColors(ctx, settings.dynamicColors)
  if (settings.hapticsEnabled !== undefined) await setHapticsEnabled(ctx, settings.hapticsEnabled)
  if (settings.serverUrl) await setServerUrlAction(ctx, settings.serverUrl)
  if (settings.sermonCachingEnabled !== undefined)
    await setSermonCachingEnabled(ctx, settings.sermonCachingEnabled)
  if (settings.toursDisabled !== undefined) await setToursDisabled(ctx, settings.toursDisabled)
  if (settings.toursSeenVersion !== undefined)
    await setToursSeenVersion(ctx, settings.toursSeenVersion)
}

/**
 * Применяет настройки звука плеера — только присутствующие в файле поля.
 * @param ctx - Reatom-контекст экшена.
 * @param player - Настройки звука из файла (или отсутствуют).
 */
export const applyPlayerScalars = async (
  ctx: Ctx,
  player: BackupImportData['player'],
): Promise<void> => {
  if (!player) return

  if (player.playbackRate !== undefined) await setPlaybackRateAction(ctx, player.playbackRate)
  if (player.repeatMode !== undefined) {
    await setRepeatModeAction(ctx, player.repeatMode)
    applyRepeatMode(player.repeatMode)
  }
  if (player.balance !== undefined) await setBalanceAction(ctx, player.balance)
  if (player.pitch !== undefined) await setPitchAction(ctx, player.pitch)
  if (player.equalizerEnabled !== undefined) await setEqEnabledAction(ctx, player.equalizerEnabled)
  if (player.equalizerGains !== undefined) await setEqGainsAction(ctx, player.equalizerGains)
}

/**
 * Пишет настройки импорта аудио через владельческий persist-путь, сливая их с
 * текущими: недостающие поля в файле не затирают сохранённый источник/адрес.
 * Невалидный итог не сохраняется.
 * @param imported - Настройки импорта из файла (или отсутствуют).
 */
export const applyYouTubeImport = async (
  imported: BackupImportData['youtubeImport'],
): Promise<void> => {
  if (!imported) return

  const stored = await readImportSettings()
  // Старый бэкап мог нести basic-auth прямо в адресе: импортируем адрес без
  // userinfo, сами учётные данные не сохраняем.
  const importedBaseUrl = imported.invidiousBaseUrl
    ? splitBasicAuthUrl(imported.invidiousBaseUrl).requestBase
    : undefined
  const merged = importSettingsSchema.safeParse({
    invidiousBaseUrl: importedBaseUrl ?? stored?.invidiousBaseUrl,
    source: imported.source ?? stored?.source,
  })

  if (!merged.success) return

  await persistImportSettings(merged.data)
}
