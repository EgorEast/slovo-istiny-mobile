import { memo, type ReactElement, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useTrackItemCache } from 'entities/offline-cache'
import {
  type MenuActionItem,
  type TrackListMenuControls,
  TracksListItem,
} from 'entities/track-list'
import { type SermonShape } from 'shared/model'
import { INDENTS } from 'shared/ui/theme'

export const PlaylistTrackItem = memo(
  ({
    artwork,
    audioUrl,
    bindMenuOpener,
    cacheActionOnboardingTargetIds,
    cacheTrigger,
    currentAudioId,
    id,
    index,
    isPlaying,
    menuActions,
    onPress,
    renderFavoriteButton,
    renderMenuItem,
    sermon,
    storedProgress,
    subtitle,
    title,
  }: {
    artwork: null | string
    audioUrl?: null | string
    bindMenuOpener?: (controls: TrackListMenuControls) => void
    cacheActionOnboardingTargetIds?: { add: string; remove: string }
    cacheTrigger?: number
    currentAudioId?: string
    id: string | undefined
    index: number
    isPlaying: boolean
    menuActions?: MenuActionItem[]
    onPress: (index: number) => void
    renderFavoriteButton?: (button: ReactElement) => ReactElement
    renderMenuItem?: (row: ReactElement, item: MenuActionItem) => ReactElement
    sermon?: SermonShape
    storedProgress?: number
    subtitle?: string
    title: string
  }) => {
    const handlePress = useCallback(() => onPress(index), [index, onPress])
    const cacheState = useTrackItemCache(audioUrl ?? undefined, cacheTrigger)

    return (
      <TracksListItem
        title={title}
        sermon={sermon}
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
        renderFavoriteButton={renderFavoriteButton}
        isAudioPlaying={currentAudioId === id && isPlaying}
        cacheActionOnboardingTargetIds={cacheActionOnboardingTargetIds}
      />
    )
  },
)

const styles = StyleSheet.create({
  row: {
    marginHorizontal: INDENTS.medium,
  },
})
