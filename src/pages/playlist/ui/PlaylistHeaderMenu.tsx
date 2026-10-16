import { useCallback } from 'react'
import { ErrorModal } from 'shared/ui/error-modal'
import { buildAddAllToPlaylistHandler } from '../lib/buildAddAllToPlaylistHandler'
import { useLocalPlaylistPublish } from '../lib/useLocalPlaylistPublish'
import { usePlaylistCacheError } from '../lib/usePlaylistCacheError'
import { usePlaylistHistoryMenu } from '../lib/usePlaylistHistoryMenu'
import { usePlaylistManagementMenu } from '../lib/usePlaylistManagementMenu'
import { usePlaylistMenuTourActions } from '../lib/usePlaylistMenuTourActions'
import { usePlaylistOfflineMenu } from '../lib/usePlaylistOfflineMenu'
import { usePlaylistShare } from '../lib/usePlaylistShare'
import { usePlaylistShareTourActions } from '../lib/usePlaylistShareTourActions'
import { PlaylistHeaderActions } from './PlaylistHeaderActions'
import { PlaylistHeaderDialogs } from './PlaylistHeaderDialogs'
import { type PlaylistHeaderMenuProps } from './PlaylistHeaderMenu.types'
import { PlaylistHeaderMenuDropdown } from './PlaylistHeaderMenuDropdown'
import { PlaylistShareModal } from './PlaylistShareModal'

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
  const offlineMenu = usePlaylistOfflineMenu(tracksData, playlistTitle)
  const {
    allCached,
    buttonRef,
    handleAddAllToOfflineOption,
    handleClearCacheOption,
    handleOpenMenu,
    handleStopCaching,
    isAddAllToOfflineDisabled,
    isCaching,
    isClearCacheDisabled,
    isOfflineItemsVisible,
    menuAnchor,
    menuVisible,
    setMenuVisible,
  } = offlineMenu

  const closeMenuSetter = useCallback(() => setMenuVisible(false), [setMenuVisible])

  const share = usePlaylistShare(playlist, closeMenuSetter)
  const closeMenu = usePlaylistMenuTourActions(
    handleOpenMenu,
    setMenuVisible,
    share.closeShareModal,
  )

  usePlaylistShareTourActions(share.openShareModal)

  const addAllHandler = buildAddAllToPlaylistHandler(onAddAllToPlaylist, playlist, closeMenu)
  const historyMenu = usePlaylistHistoryMenu(playlist, closeMenu)
  const { error, handleErrorClose } = usePlaylistCacheError(offlineMenu.cacheDialogVisible)
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
        canPublish={canPublish}
        onPublish={handlePublish}
        onShare={share.openShareModal}
        isShareDisabled={!share.canShare}
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

      {share.shareUrl !== null && (
        <PlaylistShareModal
          url={share.shareUrl}
          onClose={share.closeShareModal}
          isVisible={share.isShareModalVisible}
          onCopy={() => void share.copyShareLink()}
          onShare={() => void share.sendShareLink()}
        />
      )}

      <PlaylistHeaderDialogs
        tracksData={tracksData}
        offlineMenu={offlineMenu}
        historyMenu={historyMenu}
      />

      <ErrorModal error={error} visible={error !== null} onClose={handleErrorClose} />

      {renderDialogs()}
    </>
  )
}
