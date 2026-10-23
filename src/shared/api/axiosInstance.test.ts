import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { axiosInstance } from './axiosInstance'

const REFRESH_ENDPOINT = '/auth/refresh'
const ORIGINAL_ENDPOINT = '/sermons'

const mockGetAccessToken = jest.fn()
const mockGetRefreshToken = jest.fn()
const mockClearTokens = jest.fn()
const mockSetTokens = jest.fn()
const mockAdapter = jest.fn()

jest.mock('./secureTokenStorage', () => ({
  secureTokenStorage: {
    clearCachedUser: jest.fn(),
    clearTokens: (...args: unknown[]) => mockClearTokens(...args),
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
    getCachedUser: jest.fn(),
    getRefreshToken: (...args: unknown[]) => mockGetRefreshToken(...args),
    setCachedUser: jest.fn(),
    setTokens: (...args: unknown[]) => mockSetTokens(...args),
  },
}))

jest.mock('../lib/reatom-ctx/ctx', () => ({ ctx: {} }))

jest.mock('../model/network', () => ({
  reportServerReachable: jest.fn(),
  reportServerUnreachable: jest.fn(),
}))

jest.mock('./multipartHeaders', () => ({ dropBoundarylessMultipartHeader: jest.fn() }))

// Ответ сервера в виде ошибки (или без ответа вовсе) — так же, как его отдаёт
// настоящий адаптер axios: response отсутствует при сетевом сбое. Конфиг
// запроса обязателен: интерцептор читает error.config.url и _retry.
const createAxiosError = (config: InternalAxiosRequestConfig, status?: number) =>
  new AxiosError(
    'Request failed',
    status === undefined ? 'ERR_NETWORK' : 'ERR_BAD_REQUEST',
    config,
    undefined,
    status === undefined
      ? undefined
      : ({
          data: null,
          headers: {},
          status,
          statusText: '',
        } as unknown as AxiosResponse),
  )

describe('axiosInstance refresh-failure handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    axiosInstance.defaults.adapter = mockAdapter
    mockGetAccessToken.mockResolvedValue('access-token')
    mockGetRefreshToken.mockResolvedValue('refresh-token')
  })

  test('keeps tokens when the refresh request fails with a network error', async () => {
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      config.url === REFRESH_ENDPOINT
        ? Promise.reject(createAxiosError(config))
        : Promise.reject(createAxiosError(config, 401)),
    )

    await expect(axiosInstance.post(ORIGINAL_ENDPOINT)).rejects.toBeInstanceOf(AxiosError)

    expect(mockGetRefreshToken).toHaveBeenCalled()
    expect(mockClearTokens).not.toHaveBeenCalled()
  })

  test('clears tokens when the refresh endpoint rejects authentication', async () => {
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      Promise.reject(createAxiosError(config, 401)),
    )

    await expect(axiosInstance.post(ORIGINAL_ENDPOINT)).rejects.toBeInstanceOf(AxiosError)

    expect(mockClearTokens).toHaveBeenCalledTimes(1)
  })

  // Не-axios сбой refresh: токены не трогаем — иначе любой неожиданный сбой
  // (не AxiosError) молча вылогинивал бы администратора.
  test('keeps tokens when the refresh request fails with a non-axios error', async () => {
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      config.url === REFRESH_ENDPOINT
        ? Promise.reject(new Error('refresh failed'))
        : Promise.reject(createAxiosError(config, 401)),
    )

    await expect(axiosInstance.post(ORIGINAL_ENDPOINT)).rejects.toBeDefined()

    expect(mockClearTokens).not.toHaveBeenCalled()
  })

  // 500 на refresh — временная серверная проблема: сессию не разрушаем.
  test('keeps tokens when the refresh endpoint fails with a server error', async () => {
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      config.url === REFRESH_ENDPOINT
        ? Promise.reject(createAxiosError(config, 500))
        : Promise.reject(createAxiosError(config, 401)),
    )

    await expect(axiosInstance.post(ORIGINAL_ENDPOINT)).rejects.toBeInstanceOf(AxiosError)

    expect(mockClearTokens).not.toHaveBeenCalled()
  })

  // 403 — такой же явный отказ в авторизации, как и 401: токены обязаны быть очищены.
  test('clears tokens when the refresh endpoint forbids the refresh token', async () => {
    mockAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      config.url === REFRESH_ENDPOINT
        ? Promise.reject(createAxiosError(config, 403))
        : Promise.reject(createAxiosError(config, 401)),
    )

    await expect(axiosInstance.post(ORIGINAL_ENDPOINT)).rejects.toBeInstanceOf(AxiosError)

    expect(mockClearTokens).toHaveBeenCalledTimes(1)
  })

  // Ротация refresh-токенов: параллельные 401 обязаны делить один refresh-запрос.
  // Иначе каждый запрос обновляет пару отдельно, проигравшие получают 401 и
  // очищают сессию — молчаливый разлогин.
  test('shares a single refresh request between concurrent 401s', async () => {
    const refreshCalls: string[] = []
    let originalAttempts = 0

    mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
      if (config.url === REFRESH_ENDPOINT) {
        refreshCalls.push(config.url)
        // Держим refresh в полёте, чтобы второй 401 успел присоединиться к нему.
        await new Promise(resolve => setTimeout(resolve, 0))

        return {
          config,
          data: { accessToken: 'fresh-access-token', refreshToken: 'fresh-refresh-token' },
          headers: {},
          status: 200,
          statusText: 'OK',
        }
      }

      originalAttempts += 1
      if (originalAttempts <= 2) throw createAxiosError(config, 401)

      return {
        config,
        data: { ok: true, url: config.url },
        headers: {},
        status: 200,
        statusText: 'OK',
      }
    })

    const [first, second] = await Promise.all([
      axiosInstance.get('/sermons/first'),
      axiosInstance.get('/sermons/second'),
    ])

    expect(refreshCalls).toHaveLength(1)
    expect(mockSetTokens).toHaveBeenCalledTimes(1)
    expect(first.data).toEqual({ ok: true, url: '/sermons/first' })
    expect(second.data).toEqual({ ok: true, url: '/sermons/second' })
  })
})
