import { useCtx } from '@reatom/npm-react'
import { type ReactElement, useCallback, useState } from 'react'
import { togglePlaylistSermon } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { RemoveSermonFromPlaylistDialog } from '../ui/RemoveSermonFromPlaylistDialog'

/**
 * Owns the per-sermon removal confirmation for the playlist screen: the sermon
 * pending removal and the destructive `togglePlaylistSermon(..., false)` call.
 * The list updates from the atom once membership changes.
 * @param playlistId - The playlist the removal targets.
 * @returns The dialog element to mount and the request callback for the row menu.
 */
export const useRemoveSermonFromPlaylist = (playlistId: string) => {
  const ctx = useCtx()
  const [pendingSermon, setPendingSermon] = useState<AudioPlayerData | null>(null)

  const requestRemove = useCallback((sermon: AudioPlayerData) => setPendingSermon(sermon), [])
  const cancelRemove = useCallback(() => setPendingSermon(null), [])
  const confirmRemove = useCallback(() => {
    if (!pendingSermon) return
    void togglePlaylistSermon(ctx, playlistId, pendingSermon, false)
    setPendingSermon(null)
  }, [ctx, pendingSermon, playlistId])

  const renderDialog = (): ReactElement => (
    <RemoveSermonFromPlaylistDialog
      onCancel={cancelRemove}
      onConfirm={confirmRemove}
      visible={pendingSermon !== null}
    />
  )

  return { renderDialog, requestRemove }
}
