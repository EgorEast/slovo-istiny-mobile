import { ConfirmDialog } from 'shared/ui/confirm-dialog'
import { COLORS } from 'shared/ui/theme'

const DELETE_TITLE = 'Удалить плейлист?'
const DELETE_MESSAGE = 'Плейлист будет удалён без возможности восстановления.'
const DELETE_CONFIRM_TEXT = 'Удалить'
const CANCEL_TEXT = 'Отмена'

/**
 * Confirmation dialog for deleting a local playlist. Shared by every delete
 * entry point so the copy and the destructive styling live in one place.
 * @param root0 - Dialog props.
 * @param root0.onCancel - Dismiss without deleting.
 * @param root0.onConfirm - Confirm the deletion.
 * @param root0.visible - Whether the dialog is open.
 */
export const LocalPlaylistDeleteDialog = ({
  onCancel,
  onConfirm,
  visible,
}: {
  onCancel: () => void
  onConfirm: () => void
  visible: boolean
}) => (
  <ConfirmDialog
    visible={visible}
    onCancel={onCancel}
    title={DELETE_TITLE}
    onConfirm={onConfirm}
    message={DELETE_MESSAGE}
    cancelText={CANCEL_TEXT}
    confirmColor={COLORS.error}
    confirmText={DELETE_CONFIRM_TEXT}
  />
)
