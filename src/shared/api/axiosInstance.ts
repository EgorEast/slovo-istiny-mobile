import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'
import { DEFAULT_API_URL } from '../config/api-url'
import { ctx } from '../lib/reatom-ctx/ctx'
import { reportServerReachable, reportServerUnreachable } from '../model/network'
import { markSessionExpired } from '../model/sessionExpiry'
import { dropBoundarylessMultipartHeader } from './multipartHeaders'
import { secureTokenStorage } from './secureTokenStorage'
// ВАЖНО: никаких runtime-импортов из ./generated/** (только type-only выше и в
// tokenRefresh.ts) — иначе require cycle axiosInstance ⇄ generated/auth/auth.
import { performTokenRefresh, REFRESH_ENDPOINT } from './tokenRefresh'

// Динамический base URL: инициализируется DEFAULT_API_URL и обновляется
// экшенами shared/model (setServerUrlAction, initServerUrlAction),
// когда пользователь меняет или восстанавливает адрес сервера.
export const axiosInstance = axios.create({
  baseURL: DEFAULT_API_URL,
})

// Refresh-токен мёртв только когда сервер его явно отверг: сетевой сбой во время
// refresh — случай временный, токены остаются, чтобы следующая попытка восстановила
// сессию; иначе администратор вылогинивается молча.
const isAuthRejection = (error: unknown): boolean => {
  const status = isAxiosError(error) ? error.response?.status : undefined

  return status === 401 || status === 403
}

// Request interceptor для добавления токенов
axiosInstance.interceptors.request.use(async config => {
  dropBoundarylessMultipartHeader(config)

  // Refresh-запрос аутентифицируется refresh-токеном из тела,
  // поэтому Authorization с просроченным access-токеном ему не нужен
  const isRefreshRequest = config.url?.includes(REFRESH_ENDPOINT)
  if (isRefreshRequest) return config

  const token = await secureTokenStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

// Response interceptor для обработки ошибок, refresh токена и мониторинга статуса сервера
axiosInstance.interceptors.response.use(
  response => {
    // Сервер ответил успешно — отмечаем его как доступный
    reportServerReachable(ctx)

    return response
  },
  async error => {
    // Сетевая ошибка (сервер не ответил) — отмечаем как недоступный
    if (!error.response) reportServerUnreachable(ctx)

    const originalRequest = error.config
    const isRefreshRequest = Boolean(originalRequest.url?.includes(REFRESH_ENDPOINT))

    // Если ошибка 401 и это не запрос на refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true

      try {
        // Пытаемся обновить токен
        const newToken = await performTokenRefresh(axiosInstance)

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Хранилище и реактивное состояние сессии чистим только при явном
        // отказе в авторизации: сетевой сбой или 429 во время refresh сессию
        // не трогают (см. isAuthRejection).
        if (isAuthRejection(refreshError)) {
          await secureTokenStorage.clearTokens()
          await secureTokenStorage.clearCachedUser()

          // entities/auth слушает сигнал: гасит authUserAtom и статус,
          // после чего /admin уводит на /admin/login.
          markSessionExpired(ctx)
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Функция-обертка для mutator (Orval ожидает именно такой формат)
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> =>
  axiosInstance({
    ...config,
    ...options,
  }).then(({ data }) => data)

// Функции для работы с токенами. Делегируют в secureTokenStorage
// (expo-secure-store на native, зашифрованное IndexedDB-хранилище на web —
// см. secureTokenStorage.web.ts / webSecureStore.ts), сохраняя стабильный API
// для существующих потребителей.
export const tokenStorage = {
  clearTokens: async () => {
    await secureTokenStorage.clearTokens()
  },

  getAccessToken: async () => secureTokenStorage.getAccessToken(),

  setTokens: async (accessToken: string, refreshToken: string) => {
    await secureTokenStorage.setTokens(accessToken, refreshToken)
  },
}
