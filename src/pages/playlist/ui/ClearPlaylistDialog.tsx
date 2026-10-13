import { ConfirmDialog } from 'shared/ui/confirm-dialog'
import { COLORS } from 'shared/ui/theme'

const CLEAR_TITLE = 'Очистить плейлист?'
const CLEAR_MESSAGE = 'Все проповеди будут удалены из плейлиста'
const PLAYER_WILL_CLOSE = ' Плеер будет закрыт.'
const CLEAR_CONFIRM_TEXT = 'Очистить'
const CANCEL_TEXT = 'Отмена'

/**
 * Confirmation dialog for clearing a local playlist of every sermon. The
 * player-close warning is appended only when the cleared playlist is the one
 * currently loaded in the player.
 * @param root0 - Dialog props.
 * @param root0.onCancel - Dismiss without clearing.
 * @param root0.onConfirm - Confirm the clearing.
 * @param root0.shouldClosePlayer - Append the player-close warning.
 * @param root0.visible - Whether the dialog is open.
 */
export const ClearPlaylistDialog = ({
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
    title={CLEAR_TITLE}
    onConfirm={onConfirm}
    cancelText={CANCEL_TEXT}
    confirmColor={COLORS.error}
    confirmText={CLEAR_CONFIRM_TEXT}
    message={`${CLEAR_MESSAGE}${shouldClosePlayer ? PLAYER_WILL_CLOSE : ''}`}
  />
)
