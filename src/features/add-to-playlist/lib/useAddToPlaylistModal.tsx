import { useCallback, useState } from 'react'
import { type PlaylistData } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { AddToPlaylistModal } from '../ui/AddToPlaylistModal'
import { type AddToPlaylistBindings } from './addToPlaylistControls'
import { type AddToPlaylistState } from './addToPlaylistState'

/**
 * Держит состояние «Добавить в плейлист» для экрана: открывает модалку по
 * проповеди или по всем проповедям плейлиста и возвращает её готовый элемент для
 * рендера. Состояние живёт на уровне экрана (не строки), поэтому в списке
 * рендерится одна модалка, а не по одной на каждую строку.
 *
 * Использование: `const { openAddToPlaylist, modal } = useAddToPlaylistModal()`,
 * затем `onAddToPlaylist: openAddToPlaylist` в меню и `{modal}` в разметке.
 * @param bindings - Опциональные DI-пропсы модалки (онбординг-цели и управление
 * выбором), прокидываются как есть.
 */
export const useAddToPlaylistModal = (bindings: AddToPlaylistBindings = {}) => {
  const [state, setState] = useState<AddToPlaylistState | null>(null)
  const { bindControls, renderCreateWrapper, renderRowWrapper, renderSaveWrapper } = bindings

  const openAddToPlaylist = useCallback((sermon: SermonData) => {
    // На Android контекст-меню — тоже нативная Modal, и она закрывает свой Modal
    // в этом же кадре; если смонтировать нашу модалку сразу, нативные Modal
    // накладываются друг на друга (меню мигает поверх). Открываем следующим кадром.
    requestAnimationFrame(() => setState({ kind: 'sermon', sermon }))
  }, [])

  const openAddAllToPlaylist = useCallback((playlist: PlaylistData) => {
    // Тот же нативный Modal-конфликт, что и у одиночной проповеди: меню шапки
    // закрывается своим кадром, поэтому модалку монтируем следующим.
    requestAnimationFrame(() => setState({ kind: 'all', playlist }))
  }, [])

  const closeAddToPlaylist = useCallback(() => setState(null), [])

  return {
    modal: state && (
      <AddToPlaylistModal
        visible
        state={state}
        bindControls={bindControls}
        onClose={closeAddToPlaylist}
        renderRowWrapper={renderRowWrapper}
        renderSaveWrapper={renderSaveWrapper}
        renderCreateWrapper={renderCreateWrapper}
      />
    ),
    openAddAllToPlaylist,
    openAddToPlaylist,
  }
}
