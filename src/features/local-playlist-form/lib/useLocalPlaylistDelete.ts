import { useAction, useAtom } from '@reatom/npm-react'
import { useCallback, useState } from 'react'
import { deleteLocalPlaylist, loadMyPlaylists, myPlaylistsLoadedAtom } from 'entities/playlist'

/**
 * Confirmation state and delete call shared by every entry point that removes a
 * local playlist: the playlist header menu, the edit sheet and the section edit
 * mode. The playlist to delete is captured on `requestDelete`, so the dialog
 * itself stays id-agnostic and only the caller knows what happens afterwards.
 * Deletion hydrates `myPlaylistsAtom` first when it is still unloaded: otherwise
 * the read-modify-write would run against the seed and either no-op or be
 * overwritten by an in-flight hydration.
 * @param onDeleted - Runs after the playlist is deleted (navigation, order cleanup).
 * @returns Request/cancel/confirm handlers and the dialog visibility flag.
 */
export const useLocalPlaylistDelete = (onDeleted: (playlistId: string) => void) => {
  const deletePlaylist = useAction(deleteLocalPlaylist)
  const loadPlaylists = useAction(loadMyPlaylists)
  const [isLoaded] = useAtom(myPlaylistsLoadedAtom)
  const [pendingId, setPendingId] = useState<null | string>(null)

  const requestDelete = useCallback((playlistId: string) => setPendingId(playlistId), [])
  const cancelDelete = useCallback(() => setPendingId(null), [])

  const confirmDelete = useCallback(async () => {
    if (pendingId === null) return

    const playlistId = pendingId
    setPendingId(null)
    if (!isLoaded) await loadPlaylists()
    await deletePlaylist(playlistId)
    onDeleted(playlistId)
  }, [deletePlaylist, isLoaded, loadPlaylists, onDeleted, pendingId])

  return { cancelDelete, confirmDelete, isDeleteOpen: pendingId !== null, requestDelete }
}
