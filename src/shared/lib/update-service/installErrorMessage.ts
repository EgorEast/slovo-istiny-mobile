import {
  type ClassifiedUpdateError,
  findCodeError,
  findStatusError,
  SIGNATURE_MISMATCH_HINT,
  SIGNATURE_MISMATCH_MESSAGE,
  type UpdateErrorKind,
} from './installStatusErrors'

export const GENERIC_ERROR_MESSAGE = 'Не удалось установить обновление'

// Foreseen kinds carry a curated Russian message, so the in-dialog text is
// enough. `unknown` / `install-generic` mean classification found no known
// cause. An explicit allowlist (not a denylist of `unknown` + `install-generic`)
// is deliberate: a kind added later defaults to "unexpected" until someone
// curates it, so a not-yet-understood failure is never silently withheld from
// the global error report used for user-submitted diagnostics.
const FORESEEN_UPDATE_ERROR_KINDS: ReadonlySet<UpdateErrorKind> = new Set([
  'download',
  'extract',
  'install-aborted',
  'install-blocked',
  'install-conflict',
  'install-incompatible',
  'install-invalid',
  'install-signature',
  'install-storage',
  'offline',
])

export const isUnexpectedUpdateError = (kind: UpdateErrorKind): boolean =>
  !FORESEEN_UPDATE_ERROR_KINDS.has(kind)

const OFFLINE_HINT = 'Нет подключения к интернету'
const OFFLINE_MESSAGE = 'Нет подключения к интернету'

const DOWNLOAD_HINTS = [
  'ERR_DOWNLOAD',
  'Network request failed',
  'Download failed or was cancelled',
  'Download stalled',
  'Download timed out',
]
const DOWNLOAD_MESSAGE = 'Не удалось скачать обновление. Проверьте подключение и попробуйте снова'

const EXTRACT_HINTS = ['No .apk file found', 'Extracted APK is missing', 'unzip']
const EXTRACT_MESSAGE =
  'Не удалось распаковать обновление. Повторите попытку или скачайте его из браузера'

const includesAny = (message: string, hints: string[]): boolean =>
  hints.some(hint => message.includes(hint))

const readErrorCode = (error: Error): null | string => {
  if (!('code' in error) || typeof error.code !== 'string') return null
  return error.code
}

export const classifyUpdateError = (rawError: unknown): ClassifiedUpdateError => {
  if (!(rawError instanceof Error)) return { kind: 'unknown', message: GENERIC_ERROR_MESSAGE }

  const code = readErrorCode(rawError)
  const codeError = code ? findCodeError(code) : null
  if (codeError) return codeError

  const { message } = rawError
  if (!message) return { kind: 'unknown', message: GENERIC_ERROR_MESSAGE }

  if (message.includes(SIGNATURE_MISMATCH_HINT))
    return { kind: 'install-signature', message: SIGNATURE_MISMATCH_MESSAGE }

  if (message.includes(OFFLINE_HINT)) return { kind: 'offline', message: OFFLINE_MESSAGE }

  if (includesAny(message, DOWNLOAD_HINTS)) return { kind: 'download', message: DOWNLOAD_MESSAGE }

  if (includesAny(message, EXTRACT_HINTS)) return { kind: 'extract', message: EXTRACT_MESSAGE }

  return findStatusError(message) ?? { kind: 'install-generic', message: GENERIC_ERROR_MESSAGE }
}
