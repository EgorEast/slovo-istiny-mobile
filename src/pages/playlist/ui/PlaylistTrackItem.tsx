import { memo, type ReactElement, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useTrackItemCache } from 'entities/offline-cache'
import {
  type MenuActionItem,
  type TrackListMenuControls,
  TracksListItem,
} from 'entities/track-list'
import { INDENTS } from 'shared/ui/theme'

export const PlaylistTrackItem = memo(
  ({
    artwork,
    audioUrl,
    bindMenuOpener,
    cacheTrigger,
    currentAudioId,
    id,
    index,
    isPlaying,
    menuActions,
    onPress,
    renderMenuItem,
    storedProgress,
    subtitle,
    title,
  }: {
    artwork: null | string
    audioUrl?: null | string
    bindMenuOpener?: (controls: TrackListMenuControls) => void
    cacheTrigger?: number
    currentAudioId?: string
    id: string | undefined
    index: number
    isPlaying: boolean
    menuActions?: MenuActionItem[]
    onPress: (index: number) => void
    renderMenuItem?: (row: ReactElement, item: MenuActionItem) => ReactElement
    storedProgress?: number
    subtitle?: string
    title: string
  }) => {
    const handlePress = useCallback(() => onPress(index), [index, onPress])
    const cacheState = useTrackItemCache(audioUrl ?? undefined, cacheTrigger)

    return (
      <TracksListItem
        title={title}
        artwork={artwork}
        style={styles.row}
        subtitle={subtitle}
        onPress={handlePress}
        cacheState={cacheState}
        progress={storedProgress}
        menuActions={menuActions}
        bindMenuOpener={bindMenuOpener}
        renderMenuItem={renderMenuItem}
        audioUrl={audioUrl ?? undefined}
        isPlaying={currentAudioId === id}
        isAudioPlaying={currentAudioId === id && isPlaying}
      />
    )
  },
)

const styles = StyleSheet.create({
  row: {
    marginHorizontal: INDENTS.medium,
  },
})
