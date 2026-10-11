import { type RefObject } from 'react'
import { StyleSheet, View } from 'react-native'
import { AnchoredDropdown, type AnchorRect } from 'shared/ui/menu'
import { INDENTS, RADIUSES, useTheme } from 'shared/ui/theme'
import { PlaylistDeleteMenuItem } from './PlaylistDeleteMenuItem'
import { PlaylistHistoryMenuItem } from './PlaylistHistoryMenuItem'
import { PlaylistOfflineMenuItems } from './PlaylistOfflineMenuItems'
import { PlaylistPublishMenuItem, PUBLISH_TEXT } from './PlaylistPublishMenuItem'
import { PlaylistShareMenuItem, SHARE_TEXT } from './PlaylistShareMenuItem'

export interface PlaylistHeaderMenuDropdownProps {
  allCached: boolean
  anchor: AnchorRect | null
  anchorRef?: RefObject<null | View>
  canDelete: boolean
  canMarkAll: boolean
  canPublish: boolean
  canRemoveFromHistory: boolean
  isAddAllToOfflineDisabled: boolean
  isCaching: boolean
  isClearCacheDisabled?: boolean
  isOfflineItemsVisible?: boolean
  isShareDisabled: boolean
  onAddAllToOffline: () => void
  onClearCache: () => void
  onClose: () => void
  onDelete: () => void
  onMarkAll: () => void
  onPublish: () => void
  onRemoveFromHistory: () => void
  onShare: () => void
  onStopCaching: () => void
  visible: boolean
}

export const PlaylistHeaderMenuDropdown = ({
  allCached,
  anchor,
  anchorRef,
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

  return (
    <AnchoredDropdown
      anchor={anchor}
      visible={visible}
      onClose={onClose}
      anchorRef={anchorRef}
      menuStyle={[styles.dropdown, { backgroundColor: currentTheme.surface }]}
    >
      <PlaylistShareMenuItem onPress={onShare} text={SHARE_TEXT} isDisabled={isShareDisabled} />

      {canPublish && <PlaylistPublishMenuItem onPress={onPublish} text={PUBLISH_TEXT} />}

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
        <View style={[styles.dropdownDivider, { backgroundColor: currentTheme.textMuted }]} />
      )}
      {canMarkAll && (
        <PlaylistHistoryMenuItem
          onPress={onMarkAll}
          icon='checkmark-done'
          text='Пометить все прослушанными'
        />
      )}
      {canRemoveFromHistory && (
        <PlaylistHistoryMenuItem
          icon='time-outline'
          onPress={onRemoveFromHistory}
          text='Удалить проповеди из истории'
        />
      )}

      {canDelete && (
        <>
          <View style={[styles.dropdownDivider, { backgroundColor: currentTheme.textMuted }]} />
          <PlaylistDeleteMenuItem onPress={onDelete} />
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
  dropdownDivider: {
    height: 1,
    marginHorizontal: INDENTS.medium,
    opacity: 0.3,
  },
})
