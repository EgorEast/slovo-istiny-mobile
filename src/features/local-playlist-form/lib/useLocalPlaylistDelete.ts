import { useAction } from '@reatom/npm-react'
import { useCallback, useState } from 'react'
import { deleteLocalPlaylist } from 'entities/playlist'

/**
 * Confirmation state and delete call shared by every entry point that removes a
 * local playlist: the playlist header menu, the edit sheet and the section edit
 * mode. The playlist to delete is captured on `requestDelete`, so the dialog
 * itself stays id-agnostic and only the caller knows what happens afterwards.
 * @param onDeleted - Runs after the playlist is deleted (navigation, order cleanup).
 * @returns Request/cancel/confirm handlers and the dialog visibility flag.
 */
export const useLocalPlaylistDelete = (onDeleted: (playlistId: string) => void) => {
  const deletePlaylist = useAction(deleteLocalPlaylist)
  const [pendingId, setPendingId] = useState<null | string>(null)

  const requestDelete = useCallback((playlistId: string) => setPendingId(playlistId), [])
  const cancelDelete = useCallback(() => setPendingId(null), [])

  const confirmDelete = useCallback(async () => {
    if (pendingId === null) return

    const playlistId = pendingId
    setPendingId(null)
    await deletePlaylist(playlistId)
    onDeleted(playlistId)
  }, [deletePlaylist, onDeleted, pendingId])

  return { cancelDelete, confirmDelete, isDeleteOpen: pendingId !== null, requestDelete }
}
