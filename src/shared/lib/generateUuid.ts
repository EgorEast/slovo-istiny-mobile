const UUID_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

// Hermes has no `crypto.getRandomValues`, and the `uuid` package's `v4` relies on
// it. Runtime-only crypto is not guaranteed either, so an absent/blank generator
// degrades to a v4-shaped Math.random id instead of throwing — local playlist ids
// only need uniqueness, not cryptographic strength (same policy as
// `offline-cache/lib/webDownloadJournal`).
const fallbackUuid = (): string =>
  UUID_TEMPLATE.replace(/[xy]/g, placeholder => {
    const random = Math.floor(Math.random() * 16)
    const value = placeholder === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })

/**
 * Generates a v4-shaped UUID, preferring the runtime secure generator.
 * @returns A UUID string that passes `uuid.validate`.
 */
export const generateUuid = (): string => {
  try {
    const candidate = globalThis.crypto?.randomUUID?.()
    if (typeof candidate === 'string' && candidate.length > 0) return candidate
  } catch {
    // Runtime crypto unavailable — fall through to the JS fallback.
  }
  return fallbackUuid()
}
