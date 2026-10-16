import { ErrorModal } from 'shared/ui/error-modal'
import { buildAddAllToPlaylistHandler } from '../lib/buildAddAllToPlaylistHandler'
import { useLocalPlaylistPublish } from '../lib/useLocalPlaylistPublish'
import { usePlaylistCacheError } from '../lib/usePlaylistCacheError'
import { usePlaylistHistoryMenu } from '../lib/usePlaylistHistoryMenu'
import { usePlaylistManagementMenu } from '../lib/usePlaylistManagementMenu'
import { usePlaylistMenuTourActions } from '../lib/usePlaylistMenuTourActions'
import { usePlaylistOfflineMenu } from '../lib/usePlaylistOfflineMenu'
import { usePlaylistShare } from '../lib/usePlaylistShare'
import { PlaylistHeaderActions } from './PlaylistHeaderActions'
import { type PlaylistHeaderMenuProps } from './PlaylistHeaderMenu.types'
import { PlaylistHeaderMenuDropdown } from './PlaylistHeaderMenuDropdown'
import { PlaylistHistoryDialogs } from './PlaylistHistoryDialogs'
import { PlaylistOfflineDialogs } from './PlaylistOfflineDialogs'

const DEFAULT_MENU_LABEL = 'Меню плейлиста'

export const PlaylistHeaderMenu = ({
  accessibilityLabel = DEFAULT_MENU_LABEL,
  iconColor,
  isEditEnabled = false,
  onAddAllToPlaylist,
  onboardingTargetId,
  playlist,
  playlistTitle,
  tracksData,
}: PlaylistHeaderMenuProps) => {
  const {
    allCached,
    buttonRef,
    cachedCount,
    cacheDialogVisible,
    clearDialogVisible,
    handleAddAllToOfflineConfirm,
    handleAddAllToOfflineOption,
    handleClearCacheConfirm,
    handleClearCacheOption,
    handleOpenMenu,
    handleStopCaching,
    isAddAllToOfflineDisabled,
    isCaching,
    isClearCacheDisabled,
    isOfflineItemsVisible,
    menuAnchor,
    menuVisible,
    setCacheDialogVisible,
    setClearDialogVisible,
    setMenuVisible,
  } = usePlaylistOfflineMenu(tracksData, playlistTitle)

  const closeMenu = usePlaylistMenuTourActions(handleOpenMenu, setMenuVisible)

  const addAllHandler = buildAddAllToPlaylistHandler(onAddAllToPlaylist, playlist, closeMenu)
  const historyMenu = usePlaylistHistoryMenu(playlist, closeMenu)
  const { error, handleErrorClose } = usePlaylistCacheError(cacheDialogVisible)
  const { canShare, handleShare } = usePlaylistShare(playlist, closeMenu)
  const { canPublish, handlePublish, isLocalPlaylist } = useLocalPlaylistPublish(
    playlist,
    closeMenu,
  )
  const { canClear, canDelete, renderDialogs, requestClear, requestDelete } =
    usePlaylistManagementMenu(isEditEnabled && isLocalPlaylist, closeMenu)

  return (
    <>
      <PlaylistHeaderActions
        buttonRef={buttonRef}
        iconColor={iconColor}
        playlistId={playlist.id}
        onOpenMenu={handleOpenMenu}
        accessibilityLabel={accessibilityLabel}
        onboardingTargetId={onboardingTargetId}
        isEditable={isEditEnabled && isLocalPlaylist}
      />

      <PlaylistHeaderMenuDropdown
        anchor={menuAnchor}
        onClose={closeMenu}
        canClear={canClear}
        anchorRef={buttonRef}
        visible={menuVisible}
        canDelete={canDelete}
        allCached={allCached}
        isCaching={isCaching}
        onShare={handleShare}
        canPublish={canPublish}
        onPublish={handlePublish}
        isShareDisabled={!canShare}
        onStopCaching={handleStopCaching}
        onAddAllToPlaylist={addAllHandler}
        canMarkAll={historyMenu.canMarkAll}
        onClearCache={handleClearCacheOption}
        onClear={() => requestClear(playlist.id)}
        onDelete={() => requestDelete(playlist.id)}
        onMarkAll={historyMenu.handleMarkAllOption}
        isClearCacheDisabled={isClearCacheDisabled}
        isOfflineItemsVisible={isOfflineItemsVisible}
        onAddAllToOffline={handleAddAllToOfflineOption}
        onRemoveFromHistory={historyMenu.handleRemoveOption}
        isAddAllToOfflineDisabled={isAddAllToOfflineDisabled}
        canRemoveFromHistory={historyMenu.canRemoveFromHistory}
      />

      <PlaylistOfflineDialogs
        tracksData={tracksData}
        cachedCount={cachedCount}
        cacheDialogVisible={cacheDialogVisible}
        clearDialogVisible={clearDialogVisible}
        onClearCacheConfirm={handleClearCacheConfirm}
        onClearCancel={() => setClearDialogVisible(false)}
        onAddAllToOfflineConfirm={handleAddAllToOfflineConfirm}
        onAddToOfflineCancel={() => setCacheDialogVisible(false)}
      />

      <PlaylistHistoryDialogs
        onMarkConfirm={historyMenu.handleMarkAllConfirm}
        markDialogVisible={historyMenu.markDialogVisible}
        onRemoveConfirm={historyMenu.handleRemoveConfirm}
        removeDialogVisible={historyMenu.removeDialogVisible}
        onMarkCancel={() => historyMenu.setMarkDialogVisible(false)}
        onRemoveCancel={() => historyMenu.setRemoveDialogVisible(false)}
      />

      <ErrorModal error={error} visible={error !== null} onClose={handleErrorClose} />

      {renderDialogs()}
    </>
  )
}
