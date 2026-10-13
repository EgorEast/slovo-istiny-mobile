import { COLORS, useTheme } from 'shared/ui/theme'
import { PlaylistMenuDivider } from './PlaylistMenuDivider'
import { PlaylistOfflineMenuItem } from './PlaylistOfflineMenuItem'

/**
 * Offline-cache menu rows for the playlist header menu: add/stop caching and
 * clear-cache, preceded by the divider that separates them from the batch rows.
 * @param props - Offline menu state and handlers.
 * @param props.allCached - Whether every playable sermon is already cached.
 * @param props.isAddAllToOfflineDisabled - Disables the add-all action (e.g. Empty playlist).
 * @param props.isCaching - Whether a caching run is in progress.
 * @param props.isClearCacheDisabled - Disables the clear-cache action.
 * @param props.onAddAllToOffline - Starts caching every sermon.
 * @param props.onClearCache - Clears every cached sermon of the playlist.
 * @param props.onStopCaching - Stops the running caching run.
 */
export const PlaylistOfflineMenuItems = ({
  allCached,
  isAddAllToOfflineDisabled,
  isCaching,
  isClearCacheDisabled,
  onAddAllToOffline,
  onClearCache,
  onStopCaching,
}: {
  allCached: boolean
  isAddAllToOfflineDisabled: boolean
  isCaching: boolean
  isClearCacheDisabled: boolean
  onAddAllToOffline: () => void
  onClearCache: () => void
  onStopCaching: () => void
}) => {
  const { currentTheme } = useTheme()

  return (
    <>
      <PlaylistMenuDivider />

      {isCaching ? (
        <PlaylistOfflineMenuItem
          onPress={onStopCaching}
          icon='stop-circle-outline'
          text='Остановить добавление в офлайн'
          onboardingTargetId='playlist.menu-offline-add'
        />
      ) : (
        <PlaylistOfflineMenuItem
          onPress={onAddAllToOffline}
          isDisabled={isAddAllToOfflineDisabled}
          onboardingTargetId='playlist.menu-offline-add'
          icon={allCached ? 'check-circle-outline' : 'cloud-download'}
          text={allCached ? 'Плейлист в офлайне' : 'Добавить все в офлайн'}
        />
      )}

      <PlaylistOfflineMenuItem
        onPress={onClearCache}
        icon='cloud-off-outline'
        text='Удалить из офлайн все'
        isDisabled={isClearCacheDisabled}
        onboardingTargetId='playlist.menu-offline-remove'
        textColor={isClearCacheDisabled ? COLORS.disabled : undefined}
        iconColor={isClearCacheDisabled ? COLORS.disabled : currentTheme.text}
      />
    </>
  )
}
