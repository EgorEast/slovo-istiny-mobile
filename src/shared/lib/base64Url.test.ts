import { base64UrlToBytes, bytesToBase64Url } from './base64Url'

describe('bytesToBase64Url', () => {
  test('encodes a known vector without padding', () => {
    // "Hello" → base64 "SGVsbG8=" → base64url "SGVsbG8".
    const bytes = Uint8Array.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])

    expect(bytesToBase64Url(bytes)).toBe('SGVsbG8')
  })

  test('uses the URL-safe alphabet for bytes that map to + and /', () => {
    // 0xfb 0xff → base64 "+/8=" → base64url "-_8".
    expect(bytesToBase64Url(Uint8Array.from([0xfb, 0xff]))).toBe('-_8')
  })

  test('encodes an empty input as an empty string', () => {
    expect(bytesToBase64Url(new Uint8Array())).toBe('')
  })
})

describe('base64UrlToBytes', () => {
  test('round-trips every byte value', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index)

    expect(base64UrlToBytes(bytesToBase64Url(bytes))).toEqual(bytes)
  })

  test('round-trips lengths that exercise all padding remainders', () => {
    for (const length of [1, 2, 3, 4, 5, 16, 31, 32, 33]) {
      const bytes = Uint8Array.from({ length }, (_, index) => (index * 7) % 256)

      expect(base64UrlToBytes(bytesToBase64Url(bytes))).toEqual(bytes)
    }
  })

  test('decodes an empty string to empty bytes', () => {
    expect(base64UrlToBytes('')).toEqual(new Uint8Array())
  })

  test('returns null for invalid characters', () => {
    expect(base64UrlToBytes('abc$def')).toBeNull()
    expect(base64UrlToBytes('a+b/c')).toBeNull()
  })

  test('returns null for a length that cannot hold a whole byte', () => {
    expect(base64UrlToBytes('A')).toBeNull()
  })
})
