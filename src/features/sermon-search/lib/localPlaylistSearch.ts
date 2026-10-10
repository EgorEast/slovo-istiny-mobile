import { FAVORITES_PLAYLIST, type LocalPlaylistData, type PlaylistData } from 'entities/playlist'

const buildSearchPlaylist = (playlist: LocalPlaylistData): PlaylistData => ({
  artwork: null,
  description: undefined,
  id: playlist.id,
  sermons: [],
  title: playlist.title,
})

/**
 * Selects user-owned local playlists whose title contains the query.
 * @param playlists - Local playlists from `myPlaylistsAtom`.
 * @param query - Raw search query; matched case-insensitively.
 * @returns Matching playlists in the shape search rows consume (favorites excluded).
 */
export const selectLocalPlaylistMatches = (
  playlists: LocalPlaylistData[],
  query: string,
): PlaylistData[] => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return []

  return playlists
    .filter(playlist => playlist.id !== FAVORITES_PLAYLIST.id)
    .filter(playlist => playlist.title.toLowerCase().includes(normalizedQuery))
    .map(buildSearchPlaylist)
}

/**
 * Merges local and server playlist matches, local first, dropping id duplicates.
 * @param local - Local playlist matches (user-owned, shown first).
 * @param global - Server playlist matches.
 * @returns Concatenated list with unique playlist ids.
 */
export const mergePlaylistMatches = (
  local: PlaylistData[],
  global: PlaylistData[],
): PlaylistData[] => {
  const localIds = new Set(local.map(playlist => playlist.id))
  return [...local, ...global.filter(playlist => !localIds.has(playlist.id))]
}
