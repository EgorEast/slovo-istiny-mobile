import { type AxiosInstance } from 'axios'
import { type RefreshResponse } from './generated/api.schemas'
import { secureTokenStorage } from './secureTokenStorage'

// Единственный источник правды об эндпоинте refresh: используется и в guard'ах
// интерцепторов, и в самом запросе обновления пары токенов.
export const REFRESH_ENDPOINT = '/auth/refresh'

// Запрос идёт через переданный instance, поэтому проходит через оба интерцептора
// (guard isRefreshRequest пропускает его без Authorization и без повторного
// refresh при 401).
const requestTokenRefresh = async (instance: AxiosInstance) => {
  const storedRefreshToken = await secureTokenStorage.getRefreshToken()
  if (!storedRefreshToken) throw new Error('No refresh token available')

  const { data } = await instance.post<RefreshResponse>(REFRESH_ENDPOINT, {
    refreshToken: storedRefreshToken,
  })

  await secureTokenStorage.setTokens(data.accessToken, data.refreshToken)

  return data.accessToken
}

// Общий in-flight промис: параллельные 401 не должны слать несколько refresh
// с одним и тем же refresh-токеном — при ротации токенов проигравшие запросы
// получают 401 и очищают сессию (молчаливый разлогин).
let refreshInFlight: null | Promise<string> = null

export const performTokenRefresh = (instance: AxiosInstance): Promise<string> => {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = requestTokenRefresh(instance).finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}
