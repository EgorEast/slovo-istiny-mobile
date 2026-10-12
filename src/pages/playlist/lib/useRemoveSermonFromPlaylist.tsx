import { useCtx } from '@reatom/npm-react'
import { type ReactElement, useCallback, useState } from 'react'
import { useContinuePlayback } from 'features/continue-playback'
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
 * dialog warns about closing the player. The player reset is suppressed in the
 * entity (`suppressPlayerReset`) so this hook can offer to continue listening in
 * another playlist (`useContinuePlayback`) before falling back to closing the
 * player. The list updates from the atom once membership changes.
 * @param playlistId - The playlist the removal targets.
 * @returns The dialogs to mount and the request callback for the row menu.
 */
export const useRemoveSermonFromPlaylist = (playlistId: string) => {
  const ctx = useCtx()
  const { dialog, offer } = useContinuePlayback()
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
    const { sermon, shouldClosePlayer } = pending
    void togglePlaylistSermon(ctx, playlistId, sermon, false, { suppressPlayerReset: true })
    setPending(null)
    if (shouldClosePlayer) offer(sermon, playlistId, () => void resetPlaybackAction(ctx))
  }, [ctx, offer, pending, playlistId])

  const renderDialog = (): ReactElement => (
    <>
      <RemoveSermonFromPlaylistDialog
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
        visible={pending !== null}
        shouldClosePlayer={pending?.shouldClosePlayer ?? false}
      />
      {dialog}
    </>
  )

  return { renderDialog, requestRemove }
}
