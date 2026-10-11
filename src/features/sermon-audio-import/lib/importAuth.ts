import { secureTokenStorage } from 'shared/api'
import { ImportSourceError } from './sourceErrors'
import { findAxiosError } from './uploadWithRetry'

// Скачивание идёт мимо авторизации, а загрузка требует админ-токен: проверяем
// сессию до скачивания, чтобы не тянуть файл зря (см. restoreSession).
export const assertAuthenticated = async () => {
  const [accessToken, refreshToken] = await Promise.all([
    secureTokenStorage.getAccessToken(),
    secureTokenStorage.getRefreshToken(),
  ])

  if (!accessToken || !refreshToken) throw new ImportSourceError('unauthorized')
}

// Отказ в авторизации на загрузке: интерцептор реджектит ошибкой refresh,
// поэтому 401/403 в цепочке cause означает, что refresh сам был отклонён.
export const isAuthRejection = (error: unknown): boolean => {
  const status = findAxiosError(error)?.response?.status

  return status === 401 || status === 403
}
