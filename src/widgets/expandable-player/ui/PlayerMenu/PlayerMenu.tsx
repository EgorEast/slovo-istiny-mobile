import { useAtom, useCtx } from '@reatom/npm-react'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { type TrackCacheVisualState } from 'entities/offline-cache'
import { currentPlaylistAtom, type PlaybackRate, usePlaybackRate } from 'entities/player'
import { isLocalPlaylistId, togglePlaylistSermon } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { hapticLight } from 'shared/lib/haptics'
import { reportError } from 'shared/model/error-dialog'
import { useTheme } from 'shared/ui/theme'
import { styles } from './PlayerMenu.styles'
import { PlayerMenuItems } from './PlayerMenuItems'
import { PlayerSpeedMenu } from './PlayerSpeedMenu'
import { useMenuRevealAnimation } from './useMenuRevealAnimation'

export const PlayerMenu = ({
  audio,
  isCached,
  onAddToPlaylist,
  onClose,
  onOpenSoundSettings,
  onShowDetails,
  onToggleCache,
  visualState,
}: {
  audio: AudioPlayerData
  isCached?: boolean
  onAddToPlaylist?: (sermon: AudioPlayerData) => void
  onClose: () => void
  onOpenSoundSettings: () => void
  onShowDetails: () => void
  onToggleCache: () => void
  visualState: TrackCacheVisualState
}) => {
  const { currentTheme } = useTheme()
  const ctx = useCtx()
  const { rate, setPlaybackRate } = usePlaybackRate()
  const [playlist] = useAtom(currentPlaylistAtom)
  const [view, setView] = useState<'main' | 'speed'>('main')
  const { backdropStyle, handleLayout, wrapperStyle } = useMenuRevealAnimation()

  // The item is meaningful only when the current playlist is a local one that
  // actually contains the playing sermon.
  const canRemoveFromPlaylist =
    playlist !== null &&
    isLocalPlaylistId(playlist.id) &&
    playlist.sermons.some(sermon => sermon.id === audio.id)

  const handleDetailsPress = () => {
    onShowDetails()
    onClose()
  }

  const handleSoundSettingsPress = () => {
    onOpenSoundSettings()
    onClose()
  }

  const handleToggleCache = () => {
    onToggleCache()
    onClose()
  }

  const handleAddToPlaylistPress = () => {
    onAddToPlaylist?.(audio)
    onClose()
  }

  const handleRemoveFromPlaylistPress = () => {
    if (playlist === null) return
    void togglePlaylistSermon(ctx, playlist.id, audio, false)
    onClose()
  }

  const handleSpeedSelect = (selectedRate: PlaybackRate) => {
    void setPlaybackRate(selectedRate).catch(reportError)
    onClose()
  }

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          tabIndex={-1}
          onPress={onClose}
          onPressIn={hapticLight}
          style={styles.backdropPressable}
        />
      </Animated.View>
      <Animated.View style={[styles.menuWrapper, wrapperStyle]}>
        <View
          onLayout={handleLayout}
          style={[styles.menuContainer, { backgroundColor: currentTheme.surface }]}
        >
          {view === 'main' ? (
            <PlayerMenuItems
              rate={rate}
              isCached={isCached}
              visualState={visualState}
              onDetails={handleDetailsPress}
              onToggleCache={handleToggleCache}
              onShowSpeed={() => setView('speed')}
              onOpenSoundSettings={handleSoundSettingsPress}
              onAddToPlaylist={onAddToPlaylist ? handleAddToPlaylistPress : undefined}
              onRemoveFromPlaylist={
                canRemoveFromPlaylist ? handleRemoveFromPlaylistPress : undefined
              }
            />
          ) : (
            <PlayerSpeedMenu
              currentRate={rate}
              onSelect={handleSpeedSelect}
              onBack={() => setView('main')}
            />
          )}
        </View>
      </Animated.View>
    </>
  )
}
