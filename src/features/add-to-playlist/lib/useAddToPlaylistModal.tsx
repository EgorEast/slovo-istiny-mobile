import { useCallback, useState } from 'react'
import { type SermonData } from 'entities/sermon'
import { AddToPlaylistModal } from '../ui/AddToPlaylistModal'

/**
 * Держит состояние «Добавить в плейлист» для экрана: открывает модалку по
 * проповеди и возвращает её готовый элемент для рендера. Состояние живёт на
 * уровне экрана (не строки), поэтому в списке рендерится одна модалка, а не по
 * одной на каждую строку.
 *
 * Использование: `const { openAddToPlaylist, modal } = useAddToPlaylistModal()`,
 * затем `onAddToPlaylist: openAddToPlaylist` в меню и `{modal}` в разметке.
 */
export const useAddToPlaylistModal = () => {
  const [sermon, setSermon] = useState<null | SermonData>(null)

  const openAddToPlaylist = useCallback((next: SermonData) => {
    // На Android контекст-меню — тоже нативная Modal, и она закрывает свой Modal
    // в этом же кадре; если смонтировать нашу модалку сразу, нативные Modal
    // накладываются друг на друга (меню мигает поверх). Открываем следующим кадром.
    requestAnimationFrame(() => setSermon(next))
  }, [])

  const closeAddToPlaylist = useCallback(() => setSermon(null), [])

  return {
    modal: sermon && <AddToPlaylistModal visible sermon={sermon} onClose={closeAddToPlaylist} />,
    openAddToPlaylist,
  }
}
