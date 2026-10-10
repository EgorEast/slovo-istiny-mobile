import { base64UrlToBytes, bytesToBase64Url } from 'shared/lib/base64Url'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const UUID_BYTE_LENGTH = 16
const UUID_HEX_LENGTH = 32

// Parses a canonical UUID into its 16 raw bytes, or null when malformed.
const uuidToBytes = (uuid: string): null | Uint8Array => {
  if (!UUID_PATTERN.test(uuid)) return null

  const hex = uuid.replace(/-/g, '')
  const bytes = new Uint8Array(UUID_BYTE_LENGTH)
  for (let index = 0; index < UUID_BYTE_LENGTH; index += 1)
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)

  return bytes
}

// Formats 16 raw bytes back into a canonical lowercase UUID.
const bytesToUuid = (bytes: Uint8Array): string => {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, UUID_HEX_LENGTH),
  ].join('-')
}

/**
 * Packs ordered UUIDs into one base64url string (16 raw bytes each, concatenated).
 * @param sermonIds - Ordered ids; every id must be a canonical UUID.
 * @returns The packed base64url string, or `null` when the list is empty or any
 * id is not a UUID (callers then fall back to the readable csv form).
 */
export const packSermonIds = (sermonIds: string[]): null | string => {
  if (sermonIds.length === 0) return null

  const bytes: number[] = []
  for (const id of sermonIds) {
    const chunk = uuidToBytes(id)
    if (chunk === null) return null
    bytes.push(...chunk)
  }
  return bytesToBase64Url(Uint8Array.from(bytes))
}

/**
 * Unpacks a base64url string produced by `packSermonIds` back into UUIDs.
 * @param packed - Packed base64url payload.
 * @returns Ordered canonical UUIDs, or `null` when the payload is not valid
 * base64url, is empty, or does not hold a whole number of 16-byte UUIDs.
 */
export const unpackSermonIds = (packed: string): null | string[] => {
  const bytes = base64UrlToBytes(packed)
  if (bytes === null || bytes.length === 0 || bytes.length % UUID_BYTE_LENGTH !== 0) return null

  const ids: string[] = []
  for (let offset = 0; offset < bytes.length; offset += UUID_BYTE_LENGTH)
    ids.push(bytesToUuid(bytes.subarray(offset, offset + UUID_BYTE_LENGTH)))

  return ids
}
