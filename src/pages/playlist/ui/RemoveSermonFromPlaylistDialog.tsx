import { ConfirmDialog } from 'shared/ui/confirm-dialog'
import { COLORS } from 'shared/ui/theme'

const REMOVE_TITLE = 'Удалить из плейлиста?'
const REMOVE_MESSAGE = 'Проповедь будет удалена из этого плейлиста.'
const PLAYER_WILL_CLOSE = ' Плеер будет закрыт.'
const REMOVE_CONFIRM_TEXT = 'Удалить'
const CANCEL_TEXT = 'Отмена'

/**
 * Confirmation dialog for removing a single sermon from a local playlist. The
 * player-close warning is appended when the sermon is the one currently playing
 * from this playlist.
 * @param root0 - Dialog props.
 * @param root0.onCancel - Dismiss without removing.
 * @param root0.onConfirm - Confirm the removal.
 * @param root0.shouldClosePlayer - Append the player-close warning.
 * @param root0.visible - Whether the dialog is open.
 */
export const RemoveSermonFromPlaylistDialog = ({
  onCancel,
  onConfirm,
  shouldClosePlayer,
  visible,
}: {
  onCancel: () => void
  onConfirm: () => void
  shouldClosePlayer: boolean
  visible: boolean
}) => (
  <ConfirmDialog
    visible={visible}
    onCancel={onCancel}
    title={REMOVE_TITLE}
    onConfirm={onConfirm}
    cancelText={CANCEL_TEXT}
    confirmColor={COLORS.error}
    confirmText={REMOVE_CONFIRM_TEXT}
    message={`${REMOVE_MESSAGE}${shouldClosePlayer ? PLAYER_WILL_CLOSE : ''}`}
  />
)
