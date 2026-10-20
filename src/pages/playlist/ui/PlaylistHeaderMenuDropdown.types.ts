import { type RefObject } from 'react'
import { type ViewInstance } from 'react-native'
import { type AnchorRect } from 'shared/ui/menu'

export interface PlaylistHeaderMenuDropdownProps {
  allCached: boolean
  anchor: AnchorRect | null
  anchorRef?: RefObject<null | ViewInstance>
  canClear: boolean
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
  /**
   * Opens the batch add-to-playlist modal. Provided only by the playlist screen
   * (and only for a non-empty playlist), never by the player sheet — so the row
   * stays page-only.
   */
  onAddAllToPlaylist?: () => void
  onClear: () => void
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
