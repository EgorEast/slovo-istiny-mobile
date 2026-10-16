import { StyleSheet } from 'react-native'
import { AnchoredDropdown } from 'shared/ui/menu'
import { INDENTS, RADIUSES, useTheme } from 'shared/ui/theme'
import { PlaylistBatchMenuItems } from './PlaylistBatchMenuItems'
import { PlaylistClearMenuItem } from './PlaylistClearMenuItem'
import { PlaylistDeleteMenuItem } from './PlaylistDeleteMenuItem'
import { type PlaylistHeaderMenuDropdownProps } from './PlaylistHeaderMenuDropdown.types'
import { PlaylistHistoryMenuItem } from './PlaylistHistoryMenuItem'
import { PlaylistMenuDivider } from './PlaylistMenuDivider'
import { PlaylistOfflineMenuItems } from './PlaylistOfflineMenuItems'
import { PlaylistShareMenuItem, SHARE_TEXT } from './PlaylistShareMenuItem'

export const PlaylistHeaderMenuDropdown = ({
  allCached,
  anchor,
  anchorRef,
  canClear,
  canDelete,
  canMarkAll,
  canPublish,
  canRemoveFromHistory,
  isAddAllToOfflineDisabled,
  isCaching,
  isClearCacheDisabled = false,
  isOfflineItemsVisible = true,
  isShareDisabled,
  onAddAllToOffline,
  onAddAllToPlaylist,
  onClear,
  onClearCache,
  onClose,
  onDelete,
  onMarkAll,
  onPublish,
  onRemoveFromHistory,
  onShare,
  onStopCaching,
  visible,
}: PlaylistHeaderMenuDropdownProps) => {
  const { currentTheme } = useTheme()
  const showHistoryItems = canMarkAll || canRemoveFromHistory
  const showBatchItems = Boolean(onAddAllToPlaylist) || canPublish
  const showDestructiveItems = canClear || canDelete

  return (
    <AnchoredDropdown
      anchor={anchor}
      visible={visible}
      onClose={onClose}
      anchorRef={anchorRef}
      menuStyle={[styles.dropdown, { backgroundColor: currentTheme.surface }]}
    >
      <PlaylistShareMenuItem
        onPress={onShare}
        text={SHARE_TEXT}
        isDisabled={isShareDisabled}
        onboardingTargetId='playlist.menu-share'
      />

      {showBatchItems && (
        <PlaylistBatchMenuItems
          onPublish={onPublish}
          canPublish={canPublish}
          onAddAllToPlaylist={onAddAllToPlaylist}
        />
      )}

      {isOfflineItemsVisible && (
        <PlaylistOfflineMenuItems
          allCached={allCached}
          isCaching={isCaching}
          onClearCache={onClearCache}
          onStopCaching={onStopCaching}
          onAddAllToOffline={onAddAllToOffline}
          isClearCacheDisabled={isClearCacheDisabled}
          isAddAllToOfflineDisabled={isAddAllToOfflineDisabled}
        />
      )}

      {showHistoryItems && (
        <>
          <PlaylistMenuDivider />
          {canMarkAll && (
            <PlaylistHistoryMenuItem
              onPress={onMarkAll}
              icon='checkmark-done'
              text='Пометить все прослушанными'
              onboardingTargetId='playlist.menu-history-mark'
            />
          )}
          {canRemoveFromHistory && (
            <PlaylistHistoryMenuItem
              icon='time-outline'
              onPress={onRemoveFromHistory}
              text='Удалить проповеди из истории'
              onboardingTargetId='playlist.menu-history-remove'
            />
          )}
        </>
      )}

      {showDestructiveItems && (
        <>
          <PlaylistMenuDivider />
          {canClear && (
            <PlaylistClearMenuItem onPress={onClear} onboardingTargetId='playlist.menu-clear' />
          )}
          {canDelete && (
            <PlaylistDeleteMenuItem onPress={onDelete} onboardingTargetId='playlist.menu-delete' />
          )}
        </>
      )}
    </AnchoredDropdown>
  )
}

const styles = StyleSheet.create({
  dropdown: {
    borderRadius: RADIUSES.low,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
    elevation: 8,
    minWidth: 180,
    paddingVertical: INDENTS.lowest,
  },
})
