import { useAction } from '@reatom/npm-react'
import { useCallback, useState } from 'react'
import { renameLocalPlaylist } from 'entities/playlist'

/**
 * Состояние формы редактирования локального плейлиста.
 *
 * Название обязательно: «Сохранить» доступно, только когда обрезанное название
 * непустое и отличается от исходного. Удаление живёт отдельно
 * (`useLocalPlaylistDelete`) — общая логика для всех точек входа.
 * @param playlistId - Идентификатор редактируемого плейлиста.
 * @param currentTitle - Текущее название (предзаполнение поля).
 * @param onClose - Закрыть форму после сохранения.
 * @returns Значение и сеттер названия, доступность сохранения и обработчик.
 */
export const useEditLocalPlaylistForm = (
  playlistId: string,
  currentTitle: string,
  onClose: () => void,
) => {
  const renamePlaylist = useAction(renameLocalPlaylist)
  const [title, setTitle] = useState(currentTitle)

  const trimmedTitle = title.trim()
  const canSave = trimmedTitle.length > 0 && trimmedTitle !== currentTitle.trim()

  const save = useCallback(async () => {
    if (!canSave) return

    await renamePlaylist(playlistId, trimmedTitle)
    onClose()
  }, [canSave, onClose, playlistId, renamePlaylist, trimmedTitle])

  return { canSave, save, setTitle, title }
}
