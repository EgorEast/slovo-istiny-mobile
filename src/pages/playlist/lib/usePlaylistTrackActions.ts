import { type PlaylistData } from 'entities/playlist'
import { type AudioPlayerData, type SermonData } from 'entities/sermon'
import { usePlaylistActions } from './usePlaylistActions'
import { useRemoveSermonFromPlaylist } from './useRemoveSermonFromPlaylist'

/**
 * Composes the playlist screen's row actions with the removal confirmation:
 * play/press handlers and the context-menu builder plus the confirm dialog.
 * @param list - The playlist's sermons backing the track rows.
 * @param playlist - The playlist being displayed.
 * @param historySermonIds - Sermon ids present in listening history.
 * @param progressMap - Stored listening progress by sermon id (0..1).
 * @param onAddToPlaylist - Opens the add-to-playlist modal for a sermon.
 */
export const usePlaylistTrackActions = (
  list: SermonData[],
  playlist: PlaylistData,
  historySermonIds: Set<string>,
  progressMap: Map<string, number>,
  onAddToPlaylist?: (sermon: AudioPlayerData) => void,
) => {
  const { renderDialog, requestRemove } = useRemoveSermonFromPlaylist(playlist.id)
  const { buildMenuActions, handlePressItem, handlePressPlayAll } = usePlaylistActions(
    list,
    playlist,
    historySermonIds,
    progressMap,
    onAddToPlaylist,
    requestRemove,
  )

  return { buildMenuActions, handlePressItem, handlePressPlayAll, renderDialog }
}
