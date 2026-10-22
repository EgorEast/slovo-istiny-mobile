import { Platform } from 'react-native'
import { PressableButton } from 'shared/ui/pressable-button'
import { useTheme } from 'shared/ui/theme/ThemeContext/useTheme'
import { FavoriteSermonButton } from './FavoriteSermonButton'
import { createTracksListStyles } from './styles'
import { TracksListItemContent } from './TracksListItemContent'
import { TracksListItemContextMenu } from './TracksListItemContextMenu'
import { type TracksListItemProps } from './types'
import { useTrackListItemMenu } from './useTrackListItemMenu'

// Web: the row renders as <div role="link" tabindex=0> so Vimium hints work and
// Enter activates while Space scrolls — link semantics. Native keeps the button role.
const ROW_ACCESSIBILITY_ROLE = Platform.OS === 'web' ? 'link' : 'button'

export const TracksListItemBase = ({
  artwork,
  audioUrl,
  bindMenuOpener,
  cacheActionOnboardingTargetIds,
  cacheState,
  isAudioPlaying = false,
  isPlaying,
  menuActions,
  onPress,
  progress,
  renderFavoriteButton,
  renderMenuButton,
  renderMenuItem,
  sermon,
  style,
  subtitle,
  title,
}: TracksListItemProps) => {
  const { currentTheme } = useTheme()
  const tracksListStyles = createTracksListStyles(currentTheme)
  const {
    isCached,
    isCacheDisabled,
    isDownloading,
    isQueued,
    isSermonCachingEnabled,
    progressValue,
    toggleCache,
    visualState,
  } = cacheState
  const {
    dotsButtonRef,
    handleItemPress,
    handleToggleCache,
    handleToggleMenu,
    isMenuOpen,
    menuAnchor,
  } = useTrackListItemMenu({ audioUrl, bindMenuOpener, onPress, toggleCache })

  const bareFavoriteButton =
    sermon === undefined ? undefined : (
      <FavoriteSermonButton sermon={sermon} style={tracksListStyles.dotsButton} />
    )
  const favoriteButton =
    bareFavoriteButton === undefined || renderFavoriteButton === undefined
      ? bareFavoriteButton
      : renderFavoriteButton(bareFavoriteButton)

  return (
    <>
      <PressableButton
        onPress={handleItemPress}
        onLongPress={handleToggleMenu}
        accessibilityRole={ROW_ACCESSIBILITY_ROLE}
        style={[
          style,
          tracksListStyles.itemContainer,
          isMenuOpen && tracksListStyles.itemContainerActive,
        ]}
      >
        <TracksListItemContent
          title={title}
          artwork={artwork}
          isCached={isCached}
          progress={progress}
          ref={dotsButtonRef}
          subtitle={subtitle}
          isQueued={isQueued}
          theme={currentTheme}
          isPlaying={isPlaying}
          isDownloading={isDownloading}
          progressValue={progressValue}
          dotsOnPress={handleToggleMenu}
          isAudioPlaying={isAudioPlaying}
          favoriteButton={favoriteButton}
          renderMenuButton={renderMenuButton}
          isSermonCachingEnabled={isSermonCachingEnabled}
        />
      </PressableButton>

      <TracksListItemContextMenu
        isCached={isCached}
        anchor={menuAnchor}
        isMenuOpen={isMenuOpen}
        menuActions={menuActions}
        visualState={visualState}
        onClose={handleToggleMenu}
        renderMenuItem={renderMenuItem}
        isCacheDisabled={isCacheDisabled}
        onToggleCache={handleToggleCache}
        isSermonCachingEnabled={isSermonCachingEnabled}
        cacheActionOnboardingTargetIds={cacheActionOnboardingTargetIds}
      />
    </>
  )
}
