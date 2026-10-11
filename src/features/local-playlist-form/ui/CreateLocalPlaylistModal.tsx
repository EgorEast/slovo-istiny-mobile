import { Modal } from 'shared/ui/modal'
import { CreateLocalPlaylistForm } from './CreateLocalPlaylistForm'

/**
 * Модалка создания локального плейлиста. Форма монтируется только при
 * `visible`, поэтому её состояние (название) сбрасывается между открытиями.
 * @param root0 - Пропсы модалки.
 * @param root0.onClose - Закрыть форму.
 * @param root0.visible - Открыта ли модалка.
 */
export const CreateLocalPlaylistModal = ({
  onClose,
  visible,
}: {
  onClose: () => void
  visible: boolean
}) => (
  <Modal visible={visible} onBackdropPress={onClose}>
    {visible ? <CreateLocalPlaylistForm onClose={onClose} /> : null}
  </Modal>
)
