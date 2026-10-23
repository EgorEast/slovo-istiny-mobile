import { v7 } from 'uuid'

const UUID_BYTE_LENGTH = 16
const BYTE_MAX = 256

// Local playlist ids are UUIDv7: the creation timestamp sits in the leading
// bytes, so ids can be ordered by creation time, and the format matches the
// server-wide uuidv7 migration. `crypto.randomUUID()` is v4-only, so it is no
// longer used.
//
// Hermes does not guarantee `crypto.getRandomValues`, and runtime-only crypto can
// be missing entirely. Local ids need uniqueness, not cryptographic strength, so
// an unusable generator degrades to Math.random bytes instead of throwing (same
// policy as `offline-cache/lib/webDownloadJournal`). `v7` still stamps the
// timestamp, version and variant bits, so the degraded result remains a valid v7.
const canUseSecureRandom = (): boolean => typeof globalThis.crypto?.getRandomValues === 'function'

/** @returns 16 secure random bytes, or `null` when runtime crypto is unusable. */
const tryReadSecureRandomBytes = (): null | Uint8Array => {
  if (!canUseSecureRandom()) return null
  try {
    return globalThis.crypto.getRandomValues(new Uint8Array(UUID_BYTE_LENGTH))
  } catch {
    return null
  }
}

const fillPseudoRandomBytes = (): Uint8Array => {
  const bytes = new Uint8Array(UUID_BYTE_LENGTH)

  for (let index = 0; index < bytes.length; index += 1)
    bytes[index] = Math.floor(Math.random() * BYTE_MAX)

  return bytes
}

const fillRandomBytes = (): Uint8Array => tryReadSecureRandomBytes() ?? fillPseudoRandomBytes()

/**
 * Generates a time-ordered UUIDv7 for a local entity.
 * @returns A UUID string that passes `uuid.validate`.
 */
export const generateUuid = (): string => v7({ rng: fillRandomBytes })
