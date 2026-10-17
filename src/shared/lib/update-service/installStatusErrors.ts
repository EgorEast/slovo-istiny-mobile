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

export const SIGNATURE_MISMATCH_HINT = 'INSTALL_FAILED_UPDATE_INCOMPATIBLE'
// Stable rejection code emitted by the native apk-installer module. It has no
// SDK status of its own: the system reports a signature mismatch under the
// coarse STATUS_FAILURE_INCOMPATIBLE/STATUS_FAILURE_CONFLICT statuses.
const SIGNATURE_MISMATCH_CODE = 'INSTALL_SIGNATURE_MISMATCH'
export const SIGNATURE_MISMATCH_MESSAGE =
  'Обновление несовместимо: подписи установленной и новой версии различаются. Удалите приложение и установите его заново'

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

export const findStatusError = (message: string): ClassifiedUpdateError | null => {
  const statusName = Object.keys(STATUS_ERRORS).find(status => message.includes(status))
  return statusName ? STATUS_ERRORS[statusName] : null
}

// Machine-readable rejection codes from the native module are the primary
// classification path; status names double as codes. Text hints below stay as
// a legacy fallback for errors produced before the native module emitted codes
// (and for non-install failures, which never had codes).
export const findCodeError = (code: string): ClassifiedUpdateError | null => {
  if (code === SIGNATURE_MISMATCH_CODE)
    return { kind: 'install-signature', message: SIGNATURE_MISMATCH_MESSAGE }
  return STATUS_ERRORS[code] ?? null
}
