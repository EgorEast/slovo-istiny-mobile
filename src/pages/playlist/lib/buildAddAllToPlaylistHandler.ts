import { type PlaylistData } from 'entities/playlist'

/**
 * Builds the batch add-to-playlist handler for the playlist header menu: closes
 * the menu and forwards the playlist. Returns `undefined` when there is no
 * callback or the playlist is empty, so the row is hidden.
 * @param onAddAllToPlaylist - Batch callback, or undefined when not offered.
 * @param playlist - Playlist to add.
 * @param closeMenu - Closes the open menu before navigating.
 */
export const buildAddAllToPlaylistHandler = (
  onAddAllToPlaylist: ((playlist: PlaylistData) => void) | undefined,
  playlist: PlaylistData,
  closeMenu: () => void,
) => {
  if (!onAddAllToPlaylist || playlist.sermons.length === 0) return undefined

  return () => {
    closeMenu()
    onAddAllToPlaylist(playlist)
  }
}
