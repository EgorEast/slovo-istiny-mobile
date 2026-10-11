import { StyleSheet, View } from 'react-native'
import { COLORS, INDENTS, useTheme } from 'shared/ui/theme'
import { PlaylistOfflineMenuItem } from './PlaylistOfflineMenuItem'

/**
 * Offline-cache menu rows for the playlist header menu: add/stop caching and
 * clear-cache, with the dividers that separate them.
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
  const dividerColor = { backgroundColor: currentTheme.textMuted }

  return (
    <>
      <View style={[styles.dropdownDivider, dividerColor]} />

      {isCaching ? (
        <PlaylistOfflineMenuItem
          onPress={onStopCaching}
          icon='stop-circle-outline'
          text='Остановить добавление в офлайн'
        />
      ) : (
        <PlaylistOfflineMenuItem
          onPress={onAddAllToOffline}
          isDisabled={isAddAllToOfflineDisabled}
          icon={allCached ? 'check-circle-outline' : 'cloud-download'}
          text={allCached ? 'Плейлист в офлайне' : 'Добавить все в офлайн'}
        />
      )}

      <View style={[styles.dropdownDivider, dividerColor]} />

      <PlaylistOfflineMenuItem
        onPress={onClearCache}
        icon='cloud-off-outline'
        text='Удалить из офлайн все'
        isDisabled={isClearCacheDisabled}
        textColor={isClearCacheDisabled ? COLORS.disabled : undefined}
        iconColor={isClearCacheDisabled ? COLORS.disabled : currentTheme.text}
      />
    </>
  )
}

const styles = StyleSheet.create({
  dropdownDivider: {
    height: 1,
    marginHorizontal: INDENTS.medium,
    opacity: 0.3,
  },
})
