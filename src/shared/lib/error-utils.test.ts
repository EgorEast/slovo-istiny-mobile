import { getErrorMessage } from './error-utils'

const AXIOS_MESSAGE = 'Request failed with status code 400'

// Minimal axios-shaped failure: `isAxiosError` only checks the flag, and the
// helper reads `response.data.message` — no need to build a real AxiosError.
const axiosErrorWith = (data: unknown, status = 400) =>
  Object.assign(new Error(AXIOS_MESSAGE), {
    isAxiosError: true,
    response: { data, status },
  })

describe('getErrorMessage', () => {
  test('prefers a string message from the response body', () => {
    const error = axiosErrorWith({ message: 'password must be longer than 8 characters' })

    expect(getErrorMessage(error)).toBe('password must be longer than 8 characters')
  })

  test('joins an array of validation messages', () => {
    const error = axiosErrorWith({ message: ['title is too long', 'artist is too long'] })

    expect(getErrorMessage(error)).toBe('title is too long; artist is too long')
  })

  test('falls back to the axios message when the body has no message', () => {
    const error = axiosErrorWith({ statusCode: 400 })

    expect(getErrorMessage(error)).toBe(AXIOS_MESSAGE)
  })

  test('ignores an empty message and non-string entries', () => {
    expect(getErrorMessage(axiosErrorWith({ message: '   ' }))).toBe(
      'Request failed with status code 400',
    )
    expect(getErrorMessage(axiosErrorWith({ message: [42, 'valid'] }))).toBe('valid')
  })

  test('maps 429 to a friendly temporary-refusal message', () => {
    const error = axiosErrorWith({ message: 'ThrottlerException: Too Many Requests' }, 429)

    expect(getErrorMessage(error)).toBe('Слишком много попыток. Попробуйте через минуту')
  })

  test('keeps plain errors and strings working', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage('boom')).toBe('boom')
    expect(getErrorMessage(null)).toBe('Неизвестная ошибка')
  })
})
