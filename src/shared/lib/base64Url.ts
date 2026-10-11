// Byte-level base64url (RFC 4648 §5, unpadded). Deliberately dependency-free:
// `btoa`/`atob` are not guaranteed on every runtime and pull in string coercion,
// while the share link needs a byte-exact codec for packed UUIDs.
const BASE64_URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]*$/
const BYTES_PER_CHUNK = 3
const CHARACTERS_PER_CHUNK = 4

const characterValue = (value: string, index: number): number =>
  index < value.length ? BASE64_URL_ALPHABET.indexOf(value.charAt(index)) : -1

/**
 * Encodes raw bytes as an unpadded base64url string.
 * @param bytes - Bytes to encode.
 * @returns Base64url string using the URL-safe alphabet, without `=` padding.
 */
export const bytesToBase64Url = (bytes: Uint8Array): string => {
  let encoded = ''

  for (let index = 0; index < bytes.length; index += BYTES_PER_CHUNK) {
    const first = bytes[index]
    const second = index + 1 < bytes.length ? bytes[index + 1] : undefined
    const third = index + 2 < bytes.length ? bytes[index + 2] : undefined

    encoded += BASE64_URL_ALPHABET.charAt(first >> 2)
    encoded += BASE64_URL_ALPHABET.charAt(((first & 0b11) << 4) | ((second ?? 0) >> 4))
    if (second === undefined) break

    encoded += BASE64_URL_ALPHABET.charAt(((second & 0b1111) << 2) | ((third ?? 0) >> 6))
    if (third === undefined) break

    encoded += BASE64_URL_ALPHABET.charAt(third & 0b111111)
  }

  return encoded
}

/**
 * Decodes an unpadded base64url string back to raw bytes.
 * @param value - Base64url string (URL-safe alphabet, no `=` padding).
 * @returns The decoded bytes, or `null` when the input is not valid base64url.
 */
export const base64UrlToBytes = (value: string): null | Uint8Array => {
  if (!BASE64_URL_PATTERN.test(value)) return null
  // A single trailing character carries only 6 bits — not a whole byte.
  if (value.length % CHARACTERS_PER_CHUNK === 1) return null

  const bytes: number[] = []

  for (let index = 0; index < value.length; index += CHARACTERS_PER_CHUNK) {
    const first = characterValue(value, index)
    const second = characterValue(value, index + 1)
    const third = characterValue(value, index + 2)
    const fourth = characterValue(value, index + 3)

    bytes.push((first << 2) | (second >> 4))
    if (third >= 0) bytes.push(((second & 0b1111) << 4) | (third >> 2))
    if (fourth >= 0) bytes.push(((third & 0b11) << 6) | fourth)
  }

  return Uint8Array.from(bytes)
}
