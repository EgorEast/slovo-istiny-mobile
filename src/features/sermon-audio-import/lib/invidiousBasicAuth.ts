import { secureTokenStorage } from 'shared/api'
import { splitBasicAuthUrl, toBasicAuthHeader } from 'shared/lib/basicAuthUrl'

/**
 * Готовит запрос к инстансу: адрес без userinfo и заголовок Authorization.
 *
 * Basic-auth инстанса хранится в защищённом хранилище (`SECURE_INVIDIOUS_AUTH_KEY`)
 * и читается оттуда. Адрес с userinfo встречается только у одноразовой проверки
 * инстанса в админке — он приходит из поля ввода и никогда не сохраняется, поэтому
 * его креды имеют приоритет над сохранённым секретом.
 * @param base - Адрес инстанса (возможно, с учётными данными из поля ввода).
 */
export const parseInvidiousBasicAuth = async (
  base: string,
): Promise<{ authHeader: null | string; requestBase: string }> => {
  const { credentials: inlineCredentials, requestBase } = splitBasicAuthUrl(base)
  const credentials = inlineCredentials ?? (await secureTokenStorage.getInvidiousAuth())

  return {
    authHeader: credentials ? toBasicAuthHeader(credentials) : null,
    requestBase,
  }
}
