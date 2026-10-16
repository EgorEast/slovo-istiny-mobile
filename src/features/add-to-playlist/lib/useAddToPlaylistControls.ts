import { useEffect } from 'react'
import { type AddToPlaylistControls } from './addToPlaylistControls'

/**
 * Отдаёт владельцу управление выбором модалки, пока её содержимое смонтировано:
 * на маунте связывает `setPlaylistChecked`, на анмаунте снимает привязку
 * (`null`), чтобы тур не дёргал уже закрытый диалог.
 * @param bindControls - Биндер владельца (стабильный).
 * @param setPlaylistChecked - Переключатель выбора плейлиста по id.
 */
export const useAddToPlaylistControls = (
  bindControls: ((controls: AddToPlaylistControls | null) => void) | undefined,
  setPlaylistChecked: (playlistId: string, checked: boolean) => void,
) => {
  useEffect(() => {
    if (bindControls === undefined) return

    bindControls({ setPlaylistChecked })

    return () => bindControls(null)
  }, [bindControls, setPlaylistChecked])
}
