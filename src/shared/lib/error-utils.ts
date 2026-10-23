import { type AxiosError, isAxiosError } from 'axios'

// Сообщение из тела ответа сервера (Nest + zod DTO): поле `message` бывает и
// строкой, и массивом строк — именно там приходит описание нарушения лимита.
const getResponseMessage = (error: AxiosError): string | undefined => {
  const data = error.response?.data
  if (typeof data !== 'object' || data === null || !('message' in data)) return undefined

  const { message } = data
  if (typeof message === 'string' && message.trim() !== '') return message
  if (!Array.isArray(message)) return undefined

  const parts = message.filter(
    (item): item is string => typeof item === 'string' && item.trim() !== '',
  )
  return parts.length > 0 ? parts.join('; ') : undefined
}

// 429 — временный отказ сервера (ThrottlerGuard: вход 10/мин, refresh 30/мин),
// а не неверные данные: английское сообщение Nest/axios пользователю не годится.
const RATE_LIMIT_MESSAGE = 'Слишком много попыток. Попробуйте через минуту'

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.status === 429) return RATE_LIMIT_MESSAGE
  if (isAxiosError(error)) {
    const responseMessage = getResponseMessage(error)
    if (responseMessage !== undefined) return responseMessage
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Неизвестная ошибка'
}

// Extracts the HTTP status from an axios-style error without a type assertion:
// axios attaches the response body under `response.status`. Returns undefined
// for network errors (no response) and non-HTTP failures.
export const getHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return undefined

  const { response } = error
  if (typeof response !== 'object' || response === null || !('status' in response)) return undefined

  const { status } = response
  return typeof status === 'number' ? status : undefined
}

// Axios hangs the whole request on the error — including the Authorization
// header with the bearer token. Serializing it into the (copyable) error dialog
// leaks credentials, so an axios failure is reduced to status + code + message.
const describeAxiosError = (error: AxiosError): string => {
  const status = getHttpStatus(error)
  const statusLabel = status === undefined ? 'Network error' : `${status}`
  const codeLabel = error.code ? ` (${error.code})` : ''
  const messageLabel = error.message ? `: ${error.message}` : ''

  return `${statusLabel}${codeLabel}${messageLabel}`
}

export const getErrorDetail = (error: unknown): string => {
  if (isAxiosError(error)) return describeAxiosError(error)
  if (error instanceof Error) return error.stack || error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object')
    try {
      return JSON.stringify(error, null, 2)
    } catch {
      return String(error)
    }

  return 'Нет деталей'
}
