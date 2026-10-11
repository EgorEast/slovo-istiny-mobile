import { buildCustomPlaylistSearchParams, type CustomPlaylistPayload } from 'entities/playlist'
import { ENV } from 'shared/config'

/**
 * Builds a share URL carrying a local playlist inline, so a recipient can import
 * it without the original (server-side) playlist existing. The `custom` marker
 * makes the import win over any `playlist` param, while `title` and `sermons`
 * stay human-readable (no base64 payload).
 * @param payload - Playlist title and ordered sermon ids.
 * @returns Absolute link with `custom`, `title` and `sermons` query params.
 */
export const buildCustomPlaylistShareUrl = (payload: CustomPlaylistPayload) => {
  // URLSearchParams serializes the empty `custom` value as `custom=`; the flag
  // is kept bare (`custom&…`) so the link reads as a marker, not a key/value.
  const query = buildCustomPlaylistSearchParams(payload)
    .toString()
    .replace(/^custom=/, 'custom')

  return `https://${ENV.webHostname}/listen/playlist?${query}`
}
