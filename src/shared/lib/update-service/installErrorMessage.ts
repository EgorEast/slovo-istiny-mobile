export interface ClassifiedUpdateError {
  kind: UpdateErrorKind
  message: string
}

export type UpdateErrorKind =
  | 'download'
  | 'extract'
  | 'install-aborted'
  | 'install-blocked'
  | 'install-conflict'
  | 'install-generic'
  | 'install-incompatible'
  | 'install-invalid'
  | 'install-signature'
  | 'install-storage'
  | 'offline'
  | 'unknown'

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

const SIGNATURE_MISMATCH_HINT = 'INSTALL_FAILED_UPDATE_INCOMPATIBLE'
// Stable rejection code emitted by the native apk-installer module. It has no
// SDK status of its own: the system reports a signature mismatch under the
// coarse STATUS_FAILURE_INCOMPATIBLE/STATUS_FAILURE_CONFLICT statuses.
const SIGNATURE_MISMATCH_CODE = 'INSTALL_SIGNATURE_MISMATCH'
const SIGNATURE_MISMATCH_MESSAGE =
  'Обновление несовместимо: подписи установленной и новой версии различаются. Удалите приложение и установите его заново'

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

// Generic STATUS_FAILURE intentionally falls through to GENERIC_ERROR_MESSAGE.
const STATUS_ERRORS: Record<string, ClassifiedUpdateError> = {
  STATUS_FAILURE_ABORTED: { kind: 'install-aborted', message: 'Установка отменена' },
  STATUS_FAILURE_BLOCKED: { kind: 'install-blocked', message: 'Установка заблокирована системой' },
  STATUS_FAILURE_CONFLICT: {
    kind: 'install-conflict',
    message: 'Конфликт версий: обновление несовместимо с установленной версией',
  },
  STATUS_FAILURE_INCOMPATIBLE: {
    kind: 'install-incompatible',
    message: 'Обновление несовместимо с этим устройством или версией Android',
  },
  STATUS_FAILURE_INVALID: { kind: 'install-invalid', message: 'Файл обновления повреждён' },
  STATUS_FAILURE_STORAGE: {
    kind: 'install-storage',
    message: 'Недостаточно места для установки обновления',
  },
}

const includesAny = (message: string, hints: string[]): boolean =>
  hints.some(hint => message.includes(hint))

const findStatusError = (message: string): ClassifiedUpdateError | null => {
  const statusName = Object.keys(STATUS_ERRORS).find(status => message.includes(status))
  return statusName ? STATUS_ERRORS[statusName] : null
}

// Machine-readable rejection codes from the native module are the primary
// classification path; status names double as codes. Text hints below stay as
// a legacy fallback for errors produced before the native module emitted codes
// (and for non-install failures, which never had codes).
const findCodeError = (code: string): ClassifiedUpdateError | null => {
  if (code === SIGNATURE_MISMATCH_CODE)
    return { kind: 'install-signature', message: SIGNATURE_MISMATCH_MESSAGE }
  return STATUS_ERRORS[code] ?? null
}

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
