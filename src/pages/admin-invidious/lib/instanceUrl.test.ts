import { INPUT_LIMITS } from 'shared/lib/validation/inputLimits'
import { validateInstanceUrl } from './instanceUrl'

const HTTPS_INSTANCE = 'https://inv.phobos.observer'

const buildInstances = (count: number) =>
  Array.from({ length: count }, (_, index) => `https://instance-${index}.example`)

describe('validateInstanceUrl', () => {
  test('accepts a full https url', () => {
    expect(validateInstanceUrl(HTTPS_INSTANCE, [])).toBe('ok')
  })

  test('trims surrounding whitespace before checking', () => {
    expect(validateInstanceUrl(`  ${HTTPS_INSTANCE}  `, [])).toBe('ok')
  })

  test('rejects a url without the https scheme', () => {
    expect(validateInstanceUrl('http://inv.phobos.observer', [])).toBe('invalid')
    expect(validateInstanceUrl('inv.phobos.observer', [])).toBe('invalid')
  })

  test('rejects a duplicate', () => {
    expect(validateInstanceUrl(HTTPS_INSTANCE, [HTTPS_INSTANCE])).toBe('duplicate')
    expect(validateInstanceUrl(` ${HTTPS_INSTANCE} `, [HTTPS_INSTANCE])).toBe('duplicate')
  })

  test('rejects a url longer than the server limit', () => {
    const longUrl = `https://${'a'.repeat(INPUT_LIMITS.invidious.url)}.example`

    expect(validateInstanceUrl(longUrl, [])).toBe('tooLong')
  })

  test('rejects adding past the server limit', () => {
    expect(validateInstanceUrl(HTTPS_INSTANCE, buildInstances(INPUT_LIMITS.invidious.urls))).toBe(
      'limit',
    )
  })

  test('accepts the last free slot before the server limit', () => {
    expect(
      validateInstanceUrl(HTTPS_INSTANCE, buildInstances(INPUT_LIMITS.invidious.urls - 1)),
    ).toBe('ok')
  })
})
