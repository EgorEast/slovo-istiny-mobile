// Basic-auth инстансы задаются адресом `https://user:pass@host`, но fetch не
// принимает учётные данные в URL запроса. Креды срезаются на границе и уходят
// заголовком Authorization, а сам адрес остаётся без userinfo.

const decodeCredentialPart = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    // Битая percent-последовательность в недоверенном адресе не должна ронять
    // приложение: отправляем её как есть.
    return value
  }
}

/**
 * Отделяет учётные данные от адреса инстанса.
 * @param base - Адрес инстанса, возможно с userinfo (`user:pass@host`).
 */
export const splitBasicAuthUrl = (
  base: string,
): { credentials: null | string; requestBase: string } => {
  let url: URL

  try {
    url = new URL(base)
  } catch {
    return { credentials: null, requestBase: base }
  }

  if (!url.username) return { credentials: null, requestBase: base }

  const credentials = `${decodeCredentialPart(url.username)}:${decodeCredentialPart(url.password)}`
  url.username = ''
  url.password = ''

  return { credentials, requestBase: url.toString().replace(/\/+$/, '') }
}

/**
 * Собирает значение заголовка Authorization для basic auth.
 * @param credentials - Учётные данные в виде `user:pass`.
 */
export const toBasicAuthHeader = (credentials: string): string => `Basic ${btoa(credentials)}`
