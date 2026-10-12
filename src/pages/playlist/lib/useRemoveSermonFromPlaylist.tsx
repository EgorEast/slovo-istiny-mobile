import { useCtx } from '@reatom/npm-react'
import { type ReactElement, useCallback, useState } from 'react'
import { currentAudioAtom, currentPlaylistAtom, resetPlaybackAction } from 'entities/player'
import { togglePlaylistSermon } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { RemoveSermonFromPlaylistDialog } from '../ui/RemoveSermonFromPlaylistDialog'

interface PendingRemoval {
  sermon: AudioPlayerData
  shouldClosePlayer: boolean
}

/**
 * Owns the per-sermon removal confirmation for the playlist screen: the sermon
 * pending removal and the destructive `togglePlaylistSermon(..., false)` call.
 * Whether the removal targets the sermon currently playing from this playlist is
 * snapshotted at request time (no per-render subscription): when it does, the
 * dialog warns about closing the player and the player is reset on confirm.
 * The list updates from the atom once membership changes.
 * @param playlistId - The playlist the removal targets.
 * @returns The dialog element to mount and the request callback for the row menu.
 */
export const useRemoveSermonFromPlaylist = (playlistId: string) => {
  const ctx = useCtx()
  const [pending, setPending] = useState<null | PendingRemoval>(null)

  const requestRemove = useCallback(
    (sermon: AudioPlayerData) => {
      const shouldClosePlayer =
        ctx.get(currentPlaylistAtom)?.id === playlistId &&
        ctx.get(currentAudioAtom)?.id === sermon.id
      setPending({ sermon, shouldClosePlayer })
    },
    [ctx, playlistId],
  )

  const cancelRemove = useCallback(() => setPending(null), [])

  const confirmRemove = useCallback(() => {
    if (!pending) return
    void togglePlaylistSermon(ctx, playlistId, pending.sermon, false)
    if (pending.shouldClosePlayer) void resetPlaybackAction(ctx)
    setPending(null)
  }, [ctx, pending, playlistId])

  const renderDialog = (): ReactElement => (
    <RemoveSermonFromPlaylistDialog
      onCancel={cancelRemove}
      onConfirm={confirmRemove}
      visible={pending !== null}
      shouldClosePlayer={pending?.shouldClosePlayer ?? false}
    />
  )

  return { renderDialog, requestRemove }
}
