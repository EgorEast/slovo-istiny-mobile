import { useRouter } from 'expo-router'
import { type ReactElement, useCallback } from 'react'
import { LocalPlaylistDeleteDialog, useLocalPlaylistDelete } from 'features/local-playlist-form'

/**
 * Wires the playlist header menu's «Удалить плейлист» item: confirmation state,
 * the delete call and the `router.back()` that follows it. `canDelete` gates the
 * item to local non-favorite playlists, so favorites stay protected.
 * @param canDelete - Whether the delete item should be shown.
 * @param onCloseMenu - Closes the dropdown once deletion is confirmed.
 * @returns Item gate/handler and the confirmation dialog element.
 */
export const usePlaylistDeleteMenu = (canDelete: boolean, onCloseMenu: () => void) => {
  const router = useRouter()
  const handleDeleted = useCallback(() => {
    onCloseMenu()
    router.back()
  }, [onCloseMenu, router])
  const { cancelDelete, confirmDelete, isDeleteOpen, requestDelete } =
    useLocalPlaylistDelete(handleDeleted)

  const renderDialog = (): ReactElement => (
    <LocalPlaylistDeleteDialog
      visible={isDeleteOpen}
      onCancel={cancelDelete}
      onConfirm={() => void confirmDelete()}
    />
  )

  return { canDelete, renderDialog, requestDelete }
}
