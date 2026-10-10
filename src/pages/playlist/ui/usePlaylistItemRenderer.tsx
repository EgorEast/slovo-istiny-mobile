import { useCallback } from 'react'
import { type MenuItem } from 'shared/ui/menu'
import { PlaylistTrackItem } from './PlaylistTrackItem'
import { type TracksListData } from './usePlaylistNavigationOptions'

/**
 * Builds the stable FlatList renderer for the playlist's track rows.
 * @param props - Row dependencies from the screen (actions and player state).
 * @param props.buildMenuActions - Builds the per-row context menu, if playable.
 * @param props.cacheTrigger - Offline-cache change counter to re-render rows.
 * @param props.currentAudioId - Id of the currently playing sermon, if any.
 * @param props.handlePressItem - Press handler that plays the row's sermon.
 * @param props.isPlaying - Whether audio is currently playing.
 * @param props.progressMap - Stored listening progress by sermon id (0..1).
 * @returns A memoized row renderer.
 */
export const usePlaylistItemRenderer = ({
  buildMenuActions,
  cacheTrigger,
  currentAudioId,
  handlePressItem,
  isPlaying,
  progressMap,
}: {
  buildMenuActions: (index: number) => MenuItem[] | undefined
  cacheTrigger?: number
  currentAudioId?: string
  handlePressItem: (index: number) => void
  isPlaying: boolean
  progressMap: Map<string, number>
}) =>
  useCallback(
    ({ index, item }: { index: number; item: TracksListData[number] }) => (
      <PlaylistTrackItem
        id={item.id}
        index={index}
        title={item.title}
        isPlaying={isPlaying}
        artwork={item.artwork}
        audioUrl={item.audioUrl}
        subtitle={item.subtitle}
        onPress={handlePressItem}
        cacheTrigger={cacheTrigger}
        currentAudioId={currentAudioId}
        menuActions={buildMenuActions(index)}
        storedProgress={progressMap.get(item.id ?? '')}
      />
    ),
    [buildMenuActions, cacheTrigger, currentAudioId, handlePressItem, isPlaying, progressMap],
  )
