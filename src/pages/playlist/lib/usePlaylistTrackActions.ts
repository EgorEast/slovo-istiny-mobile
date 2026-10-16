import { type PlaylistData } from 'entities/playlist'
import { type AudioPlayerData, type SermonData } from 'entities/sermon'
import { usePlaylistActions } from './usePlaylistActions'
import { usePlaylistRowMenuTourActions } from './usePlaylistRowMenuTourActions'
import { useRemoveSermonFromPlaylist } from './useRemoveSermonFromPlaylist'

/**
 * Composes the playlist screen's row actions with the removal confirmation:
 * play/press handlers, the context-menu builder, the confirm dialog and the
 * row-menu tour actions (the first row hands over its dropdown controls).
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
  const { bindRowMenu } = usePlaylistRowMenuTourActions(onAddToPlaylist, list[0])

  return { bindRowMenu, buildMenuActions, handlePressItem, handlePressPlayAll, renderDialog }
}
