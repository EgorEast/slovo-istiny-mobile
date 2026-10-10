import {
  type CustomPlaylistPayload,
  FAVORITES_PLAYLIST,
  type LocalPlaylistData,
} from 'entities/playlist'

const hasSameSermonIds = (a: string[], b: string[]) => {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size !== setB.size) return false
  return [...setA].every(id => setB.has(id))
}

/**
 * Finds an existing local playlist identical to an imported share payload.
 *
 * Identity is title equality plus set equality of sermon ids (order-insensitive,
 * matching the "same playlist" intent of the share link). Favorites is never a
 * duplicate target — only user-owned playlists are deduplicated.
 * @param playlists - Hydrated local playlists to search.
 * @param payload - Decoded share payload (title + sermon ids).
 * @returns The matching local playlist, or `undefined`.
 */
export const findDuplicateLocalPlaylist = (
  playlists: LocalPlaylistData[],
  payload: CustomPlaylistPayload,
): LocalPlaylistData | undefined =>
  playlists.find(
    playlist =>
      playlist.id !== FAVORITES_PLAYLIST.id &&
      playlist.title === payload.title &&
      hasSameSermonIds(playlist.sermonIds, payload.sermonIds),
  )
