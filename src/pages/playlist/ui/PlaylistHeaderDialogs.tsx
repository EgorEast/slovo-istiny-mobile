import { type TrackToCache } from '../lib/PlaylistOfflineService'
import { type usePlaylistHistoryMenu } from '../lib/usePlaylistHistoryMenu'
import { type usePlaylistOfflineMenu } from '../lib/usePlaylistOfflineMenu'
import { PlaylistHistoryDialogs } from './PlaylistHistoryDialogs'
import { PlaylistOfflineDialogs } from './PlaylistOfflineDialogs'

export const PlaylistHeaderDialogs = ({
  historyMenu,
  offlineMenu,
  tracksData,
}: {
  historyMenu: ReturnType<typeof usePlaylistHistoryMenu>
  offlineMenu: ReturnType<typeof usePlaylistOfflineMenu>
  tracksData: TrackToCache[]
}) => (
  <>
    <PlaylistOfflineDialogs
      tracksData={tracksData}
      cachedCount={offlineMenu.cachedCount}
      cacheDialogVisible={offlineMenu.cacheDialogVisible}
      clearDialogVisible={offlineMenu.clearDialogVisible}
      onClearCacheConfirm={offlineMenu.handleClearCacheConfirm}
      onClearCancel={() => offlineMenu.setClearDialogVisible(false)}
      onAddAllToOfflineConfirm={offlineMenu.handleAddAllToOfflineConfirm}
      onAddToOfflineCancel={() => offlineMenu.setCacheDialogVisible(false)}
    />

    <PlaylistHistoryDialogs
      onMarkConfirm={historyMenu.handleMarkAllConfirm}
      markDialogVisible={historyMenu.markDialogVisible}
      onRemoveConfirm={historyMenu.handleRemoveConfirm}
      removeDialogVisible={historyMenu.removeDialogVisible}
      onMarkCancel={() => historyMenu.setMarkDialogVisible(false)}
      onRemoveCancel={() => historyMenu.setRemoveDialogVisible(false)}
    />
  </>
)
