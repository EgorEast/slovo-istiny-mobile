import { useAtom } from '@reatom/npm-react'
import { Pressable, Text } from 'react-native'
import { OnboardingTarget } from 'features/onboarding'
import { sermonCachingEnabledAtom, type TrackCacheVisualState } from 'entities/offline-cache'
import { type PlaybackRate } from 'entities/player'
import { formatPlaybackRate } from 'shared/lib/player'
import { isOnlineAtom } from 'shared/model'
import { PressableButton } from 'shared/ui/pressable-button'
import { useTheme } from 'shared/ui/theme'
import { getCacheActionLabel } from '../../lib/getCacheActionLabel'
import { styles } from './PlayerMenu.styles'

const SOUND_SETTINGS_TEXT = 'Настройки звука'
const ADD_TO_PLAYLIST_TEXT = 'Добавить в плейлист'

export const PlayerMenuItems = ({
  isCached,
  onAddToPlaylist,
  onDetails,
  onOpenSoundSettings,
  onRemoveFromPlaylist,
  onShowSpeed,
  onToggleCache,
  rate,
  visualState,
}: {
  isCached?: boolean
  onAddToPlaylist?: () => void
  onDetails: () => void
  onOpenSoundSettings: () => void
  onRemoveFromPlaylist?: () => void
  onShowSpeed: () => void
  onToggleCache: () => void
  rate: PlaybackRate
  visualState: TrackCacheVisualState
}) => {
  const { currentTheme } = useTheme()
  const [isOnline] = useAtom(isOnlineAtom)
  const [isSermonCachingEnabled] = useAtom(sermonCachingEnabledAtom)
  // Stop/remove-from-queue actions must stay enabled; only the cloud branch
  // (starting a download) is disabled while offline.
  const isCacheDisabled = !isOnline && !isCached && visualState === 'cloud'

  return (
    <>
      <OnboardingTarget id='player-fullscreen.menu-details'>
        <PressableButton onPress={onDetails} style={styles.menuItem}>
          <Text style={[styles.menuItemText, { color: currentTheme.text }]}>Подробнее</Text>
        </PressableButton>
      </OnboardingTarget>
      {/* Caching off in settings: the offline action is meaningless, so the
          row is not rendered at all. */}
      {isSermonCachingEnabled && (
        <PressableButton
          onPress={isCacheDisabled ? undefined : onToggleCache}
          accessibilityState={isCacheDisabled ? { disabled: true } : undefined}
          style={[styles.menuItem, isCacheDisabled && styles.menuItemDisabled]}
        >
          <Text
            style={[
              styles.menuItemText,
              { color: isCacheDisabled ? currentTheme.textMuted : currentTheme.text },
            ]}
          >
            {getCacheActionLabel(visualState, isCached ?? false)}
          </Text>
        </PressableButton>
      )}
      <OnboardingTarget id='player-fullscreen.menu-speed'>
        <PressableButton
          onPress={onShowSpeed}
          style={styles.menuItemRow}
          accessibilityLabel='Скорость воспроизведения'
        >
          <Text style={[styles.menuItemText, { color: currentTheme.text, flexShrink: 1 }]}>
            Скорость воспроизведения
          </Text>
          <Text style={[styles.menuItemValue, { color: currentTheme.textMuted, flexShrink: 0 }]}>
            {formatPlaybackRate(rate)}
          </Text>
        </PressableButton>
      </OnboardingTarget>
      {onAddToPlaylist ? (
        <PressableButton style={styles.menuItem} onPress={onAddToPlaylist}>
          <Text style={[styles.menuItemText, { color: currentTheme.text }]}>
            {ADD_TO_PLAYLIST_TEXT}
          </Text>
        </PressableButton>
      ) : (
        <Pressable style={[styles.menuItem, styles.menuItemDisabled]}>
          <Text style={[styles.menuItemTextDisabled, { color: currentTheme.textMuted }]}>
            {ADD_TO_PLAYLIST_TEXT}
          </Text>
        </Pressable>
      )}
      {onRemoveFromPlaylist && (
        <PressableButton style={styles.menuItem} onPress={onRemoveFromPlaylist}>
          <Text style={[styles.menuItemText, { color: currentTheme.text }]}>
            Удалить из текущего плейлиста и открыть в другом
          </Text>
        </PressableButton>
      )}
      <OnboardingTarget id='player-fullscreen.menu-sound'>
        <PressableButton
          style={styles.menuItemRow}
          onPress={onOpenSoundSettings}
          accessibilityLabel={SOUND_SETTINGS_TEXT}
        >
          <Text style={[styles.menuItemText, { color: currentTheme.text, flexShrink: 1 }]}>
            {SOUND_SETTINGS_TEXT}
          </Text>
        </PressableButton>
      </OnboardingTarget>
      <Pressable style={[styles.menuItem, styles.menuItemDisabled]}>
        <Text style={[styles.menuItemTextDisabled, { color: currentTheme.textMuted }]}>
          Поделиться
        </Text>
      </Pressable>
    </>
  )
}
