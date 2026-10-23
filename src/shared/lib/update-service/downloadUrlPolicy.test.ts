import { ALLOWED_UPDATE_HOSTS, assertAllowedUpdateUrl } from './downloadUrlPolicy'

const ZIP_PATH = '/releases/download/v0.3.0/slovo-propovedi-v0.3.0.zip'

describe('assertAllowedUpdateUrl', () => {
  test.each(ALLOWED_UPDATE_HOSTS)('accepts https URLs on %s', host => {
    expect(() => assertAllowedUpdateUrl(`https://${host}${ZIP_PATH}`)).not.toThrow()
  })

  test('rejects a host outside the allowlist', () => {
    expect(() => assertAllowedUpdateUrl(`https://evil.example${ZIP_PATH}`)).toThrow(
      'Update download host is not allowed: evil.example',
    )
  })

  test('rejects a non-https URL', () => {
    expect(() => assertAllowedUpdateUrl(`http://github.com${ZIP_PATH}`)).toThrow(
      'Update download URL must use https',
    )
  })

  test('rejects an unparsable URL', () => {
    expect(() => assertAllowedUpdateUrl('not a url')).toThrow('Invalid update download URL')
  })
})
