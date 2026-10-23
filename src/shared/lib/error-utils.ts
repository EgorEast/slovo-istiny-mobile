import { type AxiosError, isAxiosError } from 'axios'

export const getErrorMessage = (error: unknown): string => {
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
