import z from 'zod'
import { MAX_CUSTOM_PLAYLIST_SERMONS } from '../localPlaylists'
import { packSermonIds, unpackSermonIds } from './sermonIdPacking'

/** Payload carried by a custom local-playlist share link. */
export interface CustomPlaylistPayload {
  sermonIds: string[]
  title: string
}

// Route params of a share link arrive as a string, or as a string array when the
// key repeats. Values are parsed into the trusted `CustomPlaylistPayload` shape.
interface CustomPlaylistParams {
  sermons?: string | string[]
  title?: string | string[]
}

const customPlaylistPayloadSchema = z.object({
  sermonIds: z.array(z.string().min(1)).min(1).max(MAX_CUSTOM_PLAYLIST_SERMONS),
  title: z.string().trim().min(1),
})

const firstValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

// `sermons` is either a packed base64url string (canonical UUIDs) or a
// comma-separated list (legacy links and non-UUID ids). Packed wins when it
// decodes to whole UUIDs; anything else is read as csv, so both forms round-trip.
const parseSermonIds = (sermons: string | string[] | undefined): string[] => {
  if (sermons === undefined) return []

  const first = firstValue(sermons)
  if (first !== undefined) {
    const packed = unpackSermonIds(first)
    if (packed !== null) return packed
  }

  const parts = Array.isArray(sermons) ? sermons : [sermons]
  return parts
    .flatMap(part => part.split(','))
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

/**
 * Builds the query params of a custom local-playlist share link: the `custom`
 * marker plus the human-readable `title` and the `sermons` payload. UUID ids are
 * packed into one base64url string (16 bytes per id); when any id is not a UUID
 * the readable comma-separated form is kept instead. `URLSearchParams`
 * URI-encodes the values (Cyrillic included) on serialization.
 * @param payload - Playlist title and ordered sermon ids.
 * @param payload.sermonIds - Ordered sermon ids carried by the link.
 * @param payload.title - Playlist title carried by the link.
 * @returns Search params carrying the `custom`, `title` and `sermons` keys.
 */
export const buildCustomPlaylistSearchParams = ({ sermonIds, title }: CustomPlaylistPayload) => {
  const params = new URLSearchParams()
  params.set('custom', '')
  params.set('title', title)
  params.set('sermons', packSermonIds(sermonIds) ?? sermonIds.join(','))
  return params
}

/**
 * Parses the `title`/`sermons` route params of a custom share link, rejecting
 * malformed input: a blank title, an empty sermon list, or more than
 * `MAX_CUSTOM_PLAYLIST_SERMONS` ids yields `null`. Both the packed base64url form
 * and the readable csv form are accepted for `sermons`.
 * @param params - Raw route params (each may be a string or a string array).
 * @param params.sermons - Packed base64url or comma-separated sermon ids.
 * @param params.title - Playlist title (string or string array).
 * @returns The parsed payload, or `null` when the link is invalid.
 */
export const parseCustomPlaylistParams = ({
  sermons,
  title,
}: CustomPlaylistParams): CustomPlaylistPayload | null => {
  const parsed = customPlaylistPayloadSchema.safeParse({
    sermonIds: parseSermonIds(sermons),
    title: firstValue(title) ?? '',
  })

  return parsed.success ? parsed.data : null
}
