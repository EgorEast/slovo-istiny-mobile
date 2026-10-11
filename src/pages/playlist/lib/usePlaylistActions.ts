import { useCallback } from 'react'
import { buildHistoryMenuActions } from 'entities/listening-history'
import { usePlayNewSermon } from 'entities/player'
import { isLocalPlaylistId, type PlaylistData } from 'entities/playlist'
import { type AudioPlayerData, type SermonData, toAudioPlayerData } from 'entities/sermon'
import { type MenuItem } from 'shared/ui/menu'

const ADD_TO_PLAYLIST_TEXT = 'Добавить в плейлист'
const REMOVE_FROM_PLAYLIST_TEXT = 'Удалить из плейлиста'

// buildHistoryMenuActions pushes «Добавить в плейлист» first, so the removal
// item slots right after it (or leads when the add item is absent).
const insertAfterAddToPlaylist = (actions: MenuItem[], item: MenuItem): MenuItem[] => {
  const addIndex = actions.findIndex(action => action.text === ADD_TO_PLAYLIST_TEXT)
  const insertAt = addIndex === -1 ? 0 : addIndex + 1
  return [...actions.slice(0, insertAt), item, ...actions.slice(insertAt)]
}

/**
 * Composes the playlist screen's per-item actions: press-to-play, play-all and
 * the context-menu actions built from listening-history state.
 * @param list - The playlist's sermons backing the track rows.
 * @param playlist - The playlist being displayed.
 * @param historySermonIds - Sermon ids present in listening history.
 * @param progressMap - Stored listening progress by sermon id (0..1).
 * @param onAddToPlaylist - Opens the add-to-playlist modal for a sermon.
 * @param onRemoveRequest - Opens the removal confirmation for a sermon (local playlists only).
 */
export const usePlaylistActions = (
  list: SermonData[],
  playlist: PlaylistData,
  historySermonIds: Set<string>,
  progressMap: Map<string, number>,
  onAddToPlaylist?: (sermon: AudioPlayerData) => void,
  onRemoveRequest?: (sermon: AudioPlayerData) => void,
) => {
  const playNewSermon = usePlayNewSermon()

  const handlePressItem = useCallback(
    async (index: number) => {
      const sermon = list[index]
      if (!sermon.audioUrl) return
      await playNewSermon({ playlist, sermon })
    },
    [list, playNewSermon, playlist],
  )

  const buildMenuActions = useCallback(
    (index: number): MenuItem[] | undefined => {
      const sermon = list[index]
      const audio = sermon ? toAudioPlayerData(sermon) : null
      if (!audio) return undefined
      const actions = buildHistoryMenuActions({
        inHistory: historySermonIds.has(audio.id),
        isCompleted: progressMap.get(audio.id) === 1,
        onAddToPlaylist,
        playlist,
        sermon: audio,
      })
      // Removal targets local playlists only («Избранные» and `custom-…`);
      // server playlists identify by UUID.
      if (!onRemoveRequest || !isLocalPlaylistId(playlist.id)) return actions
      return insertAfterAddToPlaylist(actions, {
        icon: 'playlist-remove',
        iconFamily: 'material-community',
        onPress: () => onRemoveRequest(audio),
        text: REMOVE_FROM_PLAYLIST_TEXT,
      })
    },
    [historySermonIds, list, onAddToPlaylist, onRemoveRequest, playlist, progressMap],
  )

  const handlePressPlayAll = useCallback(
    async (target?: SermonData) => {
      const sermon = target ?? list.find((s: SermonData) => s.audioUrl)
      if (!sermon) return
      await playNewSermon({ playlist, sermon })
    },
    [list, playNewSermon, playlist],
  )

  return { buildMenuActions, handlePressItem, handlePressPlayAll }
}
