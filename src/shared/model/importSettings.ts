import { secureTokenStorage } from '../api/secureTokenStorage'
import { splitBasicAuthUrl } from '../lib/basicAuthUrl'
import { getCachedJson, setCachedJson } from '../lib/cache'
import { importSettingsSchema, legacyImportSettingsSchema } from './importSettingsSchema'

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

/**
 * Выносит учётные данные из сохранённого адреса в защищённое хранилище и
 * перезаписывает адрес без userinfo. Одноразовость обеспечивает сама перезапись:
 * после неё userinfo в хранилище нет, поэтому повторное чтение миграцию не запустит.
 * @param stored - Сохранённые настройки, возможно с userinfo в адресе.
 */
const migrateInvidiousCredentials = async (
  stored: ImportSettings,
): Promise<ImportSettings | undefined> => {
  const { credentials, requestBase } = splitBasicAuthUrl(stored.invidiousBaseUrl)

  if (!credentials) {
    const parsed = importSettingsSchema.safeParse(stored)
    return parsed.success ? parsed.data : undefined
  }

  const migrated = importSettingsSchema.safeParse({
    ...stored,
    invidiousBaseUrl: requestBase,
  })
  if (!migrated.success) return undefined

  // Секрет пишется до перезаписи адреса: сбой на любом шаге оставит в хранилище
  // адрес с userinfo, и миграция просто повторится при следующем чтении.
  await secureTokenStorage.setInvidiousAuth(credentials)
  await setCachedJson(YOUTUBE_IMPORT_SETTINGS, migrated.data)

  return migrated.data
}

/** Читает настройки импорта как есть: отсутствие/невалидность → `undefined`. */
export const readImportSettings = async (): Promise<ImportSettings | undefined> => {
  try {
    const stored = await getCachedJson(YOUTUBE_IMPORT_SETTINGS, legacyImportSettingsSchema)

    return stored ? await migrateInvidiousCredentials(stored) : undefined
  } catch (error) {
    console.warn('Failed to read youtube import settings', error)
    return undefined
  }
}

const isSameOrigin = (first: string, second: string): boolean => {
  try {
    return new URL(first).origin === new URL(second).origin
  } catch {
    return false
  }
}

// Смена хоста инстанса делает сохранённый basic-auth неактуальным: старый
// секрет не должен уйти на другой адрес. Смена пути в пределах origin секрет
// сохраняет.
const clearStaleInvidiousAuth = async (nextBaseUrl: string): Promise<void> => {
  const stored = await readImportSettings()
  if (!stored || isSameOrigin(stored.invidiousBaseUrl, nextBaseUrl)) return

  await secureTokenStorage.clearInvidiousAuth()
}

/**
 * Единственный путь записи настроек импорта в AsyncStorage (владелец ключа).
 * Учётные данные из адреса пишутся только в защищённое хранилище, а в ключ
 * попадает адрес без userinfo.
 * @param settings - Настройки для записи в хранилище.
 */
export const persistImportSettings = async (settings: ImportSettings): Promise<void> => {
  try {
    const { credentials, requestBase } = splitBasicAuthUrl(settings.invidiousBaseUrl)
    const parsed = importSettingsSchema.safeParse({
      ...settings,
      invidiousBaseUrl: requestBase,
    })

    if (!parsed.success) {
      console.warn('Failed to save youtube import settings', parsed.error)
      return
    }

    if (credentials) await secureTokenStorage.setInvidiousAuth(credentials)
    else await clearStaleInvidiousAuth(requestBase)

    await setCachedJson(YOUTUBE_IMPORT_SETTINGS, parsed.data)
  } catch (error) {
    console.warn('Failed to save youtube import settings', error)
  }
}

/** Настройки импорта из хранилища; при отсутствии/невалидности — дефолт. */
export const loadImportSettings = async (): Promise<ImportSettings> =>
  (await readImportSettings()) ?? DEFAULT_SETTINGS
