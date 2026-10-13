import { useAction, useCtx } from '@reatom/npm-react'
import { type ReactElement, useCallback, useState } from 'react'
import { currentPlaylistAtom, resetPlaybackAction } from 'entities/player'
import { clearLocalPlaylistSermons } from 'entities/playlist'
import { ClearPlaylistDialog } from '../ui/ClearPlaylistDialog'

interface PendingClear {
  playlistId: string
  shouldClosePlayer: boolean
}

/**
 * Wires the playlist header menu's «Очистить плейлист» item: whether the target
 * playlist is the one loaded in the player is snapshotted at click time (no
 * per-render subscription — same philosophy as the player-menu snapshot), so the
 * dialog warning and the player reset are decided once. The page stays put — the
 * playlist still exists, only its sermons are gone.
 * @param canClear - Whether the clear item should be shown.
 * @param onCloseMenu - Closes the dropdown once clearing is requested.
 * @returns Item gate/handler and the confirmation dialog element.
 */
export const usePlaylistClearMenu = (canClear: boolean, onCloseMenu: () => void) => {
  const ctx = useCtx()
  const clearPlaylist = useAction(clearLocalPlaylistSermons)
  const resetPlayback = useAction(resetPlaybackAction)
  const [pending, setPending] = useState<null | PendingClear>(null)

  const requestClear = useCallback(
    (playlistId: string) => {
      onCloseMenu()
      setPending({
        playlistId,
        shouldClosePlayer: ctx.get(currentPlaylistAtom)?.id === playlistId,
      })
    },
    [ctx, onCloseMenu],
  )

  const cancelClear = useCallback(() => setPending(null), [])

  const confirmClear = useCallback(async () => {
    if (!pending) return
    const { playlistId, shouldClosePlayer } = pending
    setPending(null)
    await clearPlaylist(playlistId)
    if (shouldClosePlayer) await resetPlayback()
  }, [clearPlaylist, pending, resetPlayback])

  const renderDialog = (): ReactElement => (
    <ClearPlaylistDialog
      onCancel={cancelClear}
      visible={pending !== null}
      onConfirm={() => void confirmClear()}
      shouldClosePlayer={pending?.shouldClosePlayer ?? false}
    />
  )

  return { canClear, renderDialog, requestClear }
}
