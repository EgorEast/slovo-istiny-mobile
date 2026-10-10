import { Modal } from 'shared/ui/modal'
import { EditLocalPlaylistForm } from './EditLocalPlaylistForm'

/**
 * Модалка редактирования локального плейлиста (переименование + удаление).
 * Форма монтируется только при `visible`, поэтому её состояние (название)
 * сбрасывается между открытиями.
 * @param root0 - Пропсы модалки.
 * @param root0.currentTitle - Текущее название плейлиста (предзаполнение).
 * @param root0.onClose - Закрыть форму.
 * @param root0.playlistId - Идентификатор редактируемого плейлиста.
 * @param root0.visible - Открыта ли модалка.
 */
export const EditLocalPlaylistModal = ({
  currentTitle,
  onClose,
  playlistId,
  visible,
}: {
  currentTitle: string
  onClose: () => void
  playlistId: string
  visible: boolean
}) => (
  <Modal visible={visible} onBackdropPress={onClose}>
    {visible ? (
      <EditLocalPlaylistForm
        onClose={onClose}
        playlistId={playlistId}
        currentTitle={currentTitle}
      />
    ) : null}
  </Modal>
)
