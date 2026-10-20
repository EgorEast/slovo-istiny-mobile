import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { type PlaylistData } from 'entities/playlist'
import { type AudioPlayerData, formatSermonReference } from 'entities/sermon'
import { type createStyles, PLAYLIST_SHEET_ROW_STRIDE } from './PlaylistBottomSheet.styles'
import { PlaylistSheetRow } from './PlaylistSheetRow'
import { useScrollGuarantee } from './useScrollGuarantee'
import { useSheetMenuActions } from './useSheetMenuActions'

export interface TrackListItemData {
  artwork?: null | string
  id: string
  subtitle?: string
  title: string
  url?: string
}

interface UsePlaylistSheetListParams {
  cacheTrigger: number
  currentAudioId?: string
  isAudioPlaying: boolean
  onAddToPlaylist?: (sermon: AudioPlayerData) => void
  onPress: (index: number) => void
  onScroll: (y: number) => void
  playlist: PlaylistData
  progressMap: Map<string, number>
  settleTick: number
  sheetTop: number
  styles: ReturnType<typeof createStyles>
}

// Composes the list's data and handlers: playlist→track rows memo, the scroll
// guarantee footer, and the memoized row/separator renderers.
export const usePlaylistSheetList = ({
  cacheTrigger,
  currentAudioId,
  isAudioPlaying,
  onAddToPlaylist,
  onPress,
  onScroll,
  playlist,
  progressMap,
  settleTick,
  sheetTop,
  styles,
}: UsePlaylistSheetListParams) => {
  const tracksListData = useMemo<TrackListItemData[]>(
    () =>
      playlist.sermons.map(sermon => ({
        artwork: playlist.artwork,
        id: sermon.id,
        subtitle: formatSermonReference({
          book: sermon.book,
          chapter: sermon.chapter,
          verse: sermon.verse,
        }),
        title: sermon.title,
        url: sermon.audioUrl ?? undefined,
      })),
    [playlist],
  )
  const { footerHeight, handleContentSizeChange, handleWrapperLayout, maxListHeight, wrapperRef } =
    useScrollGuarantee({
      settleTick,
      sheetTop,
    })

  const handleScrollEvent = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      onScroll(event.nativeEvent.contentOffset.y)
    },
    [onScroll],
  )
  const buildMenuActions = useSheetMenuActions(playlist, progressMap, onAddToPlaylist)
  // Every row has the same fixed height, so the exact offset is known upfront:
  // scrollToIndex lands in one scroll instead of estimate + retries.
  const getItemLayout = useCallback(
    (_data: ArrayLike<TrackListItemData> | null | undefined, index: number) => ({
      index,
      length: PLAYLIST_SHEET_ROW_STRIDE,
      offset: PLAYLIST_SHEET_ROW_STRIDE * index,
    }),
    [],
  )
  const renderItem = useCallback(
    ({ index, item }: { index: number; item: TrackListItemData }) => (
      <PlaylistSheetRow
        id={item.id}
        index={index}
        onPress={onPress}
        title={item.title}
        audioUrl={item.url}
        artwork={item.artwork}
        subtitle={item.subtitle}
        cacheTrigger={cacheTrigger}
        isPlaying={currentAudioId === item.id}
        menuActions={buildMenuActions(item.id)}
        isAudioPlaying={currentAudioId === item.id && isAudioPlaying}
      />
    ),
    [buildMenuActions, cacheTrigger, currentAudioId, isAudioPlaying, onPress],
  )
  const ItemSeparator = useCallback(() => <View style={styles.divider} />, [styles])

  return {
    footerHeight,
    getItemLayout,
    handleContentSizeChange,
    handleScrollEvent,
    handleWrapperLayout,
    ItemSeparator,
    maxListHeight,
    renderItem,
    tracksListData,
    wrapperRef,
  }
}
