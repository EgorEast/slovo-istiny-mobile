import { useCallback } from 'react'
import { buildHistoryMenuActions } from 'entities/listening-history'
import { usePlayNewSermon } from 'entities/player'
import { type PlaylistData, useIsLocalPlaylist } from 'entities/playlist'
import { type AudioPlayerData, type SermonData, toAudioPlayerData } from 'entities/sermon'
import { type MenuActionItem } from 'entities/track-list'
import { type MenuItem } from 'shared/ui/menu'

const ADD_TO_PLAYLIST_TEXT = 'Добавить в плейлист'
const REMOVE_FROM_PLAYLIST_TEXT = 'Удалить из плейлиста'
const MARK_LISTENED_TEXT = 'Пометить прослушанной'
const REMOVE_FROM_HISTORY_TEXT = 'Удалить из истории'

// buildHistoryMenuActions pushes «Добавить в плейлист» first, so the removal
// item slots right after it (or leads when the add item is absent).
const insertAfterAddToPlaylist = (actions: MenuItem[], item: MenuItem): MenuItem[] => {
  const addIndex = actions.findIndex(action => action.text === ADD_TO_PLAYLIST_TEXT)
  const insertAt = addIndex === -1 ? 0 : addIndex + 1
  return [...actions.slice(0, insertAt), item, ...actions.slice(insertAt)]
}

// The tour spotlights the first row's dropdown items, so only those rows carry an
// onboarding target id; other rows' menus stay untargeted.
const onboardingTargetIdForText = (text: string): string | undefined => {
  if (text === ADD_TO_PLAYLIST_TEXT) return 'playlist.row-menu-add'
  if (text === REMOVE_FROM_PLAYLIST_TEXT) return 'playlist.row-menu-remove'
  if (text === MARK_LISTENED_TEXT) return 'playlist.row-menu-mark'
  if (text === REMOVE_FROM_HISTORY_TEXT) return 'playlist.row-menu-history-remove'
  return undefined
}

const withOnboardingTargets = (actions: MenuActionItem[]): MenuActionItem[] =>
  actions.map(action => {
    const onboardingTargetId = onboardingTargetIdForText(action.text)
    return onboardingTargetId === undefined ? action : { ...action, onboardingTargetId }
  })

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
  // Removal targets playlists present in «Мои плейлисты» (`myPlaylistsAtom`):
  // «Избранные», созданные вручную и импортированные — включая uuid-id.
  const isLocalPlaylist = useIsLocalPlaylist(playlist.id)

  const handlePressItem = useCallback(
    async (index: number) => {
      const sermon = list[index]
      if (!sermon.audioUrl) return
      await playNewSermon({ playlist, sermon })
    },
    [list, playNewSermon, playlist],
  )

  const buildMenuActions = useCallback(
    (index: number): MenuActionItem[] | undefined => {
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
      const withRemove =
        onRemoveRequest && isLocalPlaylist
          ? insertAfterAddToPlaylist(actions, {
              icon: 'playlist-remove',
              iconFamily: 'material-community',
              onPress: () => onRemoveRequest(audio),
              text: REMOVE_FROM_PLAYLIST_TEXT,
            })
          : actions
      return index === 0 ? withOnboardingTargets(withRemove) : withRemove
    },
    [
      historySermonIds,
      isLocalPlaylist,
      list,
      onAddToPlaylist,
      onRemoveRequest,
      playlist,
      progressMap,
    ],
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
