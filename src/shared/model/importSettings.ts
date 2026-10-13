import z from 'zod'
import { getCachedJson, setCachedJson } from '../lib/cache'

// Настройки импорта живут в одном ключе: при смене источника или адреса
// инстанса перезаписывается весь объект. Ключ объявлен здесь, а не в
// shared/config, потому что принадлежит только модулю импорта аудио.
const YOUTUBE_IMPORT_SETTINGS = 'youtube_import_settings'

// Дефолтный адрес инстанса. Используется и как настройка по умолчанию, и как
// единственный запасной пресет, если список с бэкенда не загрузился.
export const DEFAULT_INVIDIOUS_BASE_URL = 'https://inv.phobos.observer'

/** Выбор источника импорта аудио проповеди и адрес инстанса Invidious. */
export interface ImportSettings {
  invidiousBaseUrl: string
  source: 'invidious' | 'youtube'
}

/** Настройки импорта по умолчанию: публичный Invidious-инстанс. */
export const DEFAULT_SETTINGS: ImportSettings = {
  invidiousBaseUrl: DEFAULT_INVIDIOUS_BASE_URL,
  source: 'invidious',
}

// Значение из хранилища — недоверенный ввод (оно переживает обновления
// приложения), поэтому читаем его через схему, а не доверяя форме. http://
// разрешён: инстанс часто поднимают локально в своей сети. `z.url()` принимает
// и userinfo (basic auth: `https://user:pass@host`) — учётные данные легальны,
// запрос уйдёт с заголовком Authorization.
export const importSettingsSchema = z.object({
  invidiousBaseUrl: z.url().refine(url => url.startsWith('http://') || url.startsWith('https://')),
  source: z.enum(['invidious', 'youtube']),
})

/** Читает настройки импорта как есть: отсутствие/невалидность → `undefined`. */
export const readImportSettings = async (): Promise<ImportSettings | undefined> => {
  try {
    return await getCachedJson(YOUTUBE_IMPORT_SETTINGS, importSettingsSchema)
  } catch (error) {
    console.warn('Failed to read youtube import settings', error)
    return undefined
  }
}

/**
 * Единственный путь записи настроек импорта в AsyncStorage (владелец ключа).
 * @param settings - Настройки для записи в хранилище.
 */
export const persistImportSettings = async (settings: ImportSettings): Promise<void> => {
  try {
    await setCachedJson(YOUTUBE_IMPORT_SETTINGS, settings)
  } catch (error) {
    console.warn('Failed to save youtube import settings', error)
  }
}

/** Настройки импорта из хранилища; при отсутствии/невалидности — дефолт. */
export const loadImportSettings = async (): Promise<ImportSettings> =>
  (await readImportSettings()) ?? DEFAULT_SETTINGS
