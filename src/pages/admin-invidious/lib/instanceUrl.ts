import { INPUT_LIMITS } from 'shared/lib/validation/inputLimits'

export const INSTANCE_URL_PREFIX = 'https://'
export const INSTANCE_LIMIT_MESSAGE = `Нельзя добавить больше ${INPUT_LIMITS.invidious.urls} источников`
export const INSTANCE_TOO_LONG_MESSAGE = `Адрес должен быть не длиннее ${INPUT_LIMITS.invidious.url} символов`

export type AddInstanceResult = 'duplicate' | 'invalid' | 'limit' | 'ok' | 'tooLong'

const isTooLong = (url: string) => url.trim().length > INPUT_LIMITS.invidious.url

const isLimitReached = (existing: readonly string[]) =>
  existing.length >= INPUT_LIMITS.invidious.urls

/**
 * Серверные границы списка: длина одного адреса и общее число адресов.
 * Возвращает русское сообщение для тоста либо `null`, если нарушения нет.
 * @param url - Проверяемый адрес инстанса.
 * @param existing - Текущий список адресов.
 */
export const instanceLimitError = (url: string, existing: readonly string[]): null | string => {
  if (isTooLong(url)) return INSTANCE_TOO_LONG_MESSAGE
  if (isLimitReached(existing)) return INSTANCE_LIMIT_MESSAGE

  return null
}

/**
 * Проверяет адрес перед добавлением в список: он обязан быть полным https-URL
 * (бэкенд отвергает остальные), укладываться в серверный лимит длины и не
 * дублировать уже добавленные. Список тоже ограничен сервером (100 адресов).
 * @param url - Введённый администратором адрес.
 * @param existing - Текущий список адресов.
 */
export const validateInstanceUrl = (
  url: string,
  existing: readonly string[],
): AddInstanceResult => {
  const trimmed = url.trim()

  if (!trimmed.startsWith(INSTANCE_URL_PREFIX)) return 'invalid'
  if (isTooLong(trimmed)) return 'tooLong'
  if (existing.includes(trimmed)) return 'duplicate'
  if (isLimitReached(existing)) return 'limit'

  return 'ok'
}
