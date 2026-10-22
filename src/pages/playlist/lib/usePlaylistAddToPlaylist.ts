import { useAddToPlaylistModal } from 'features/add-to-playlist'
import { useAddToPlaylistTour } from './useAddToPlaylistTour'

/**
 * Композиция модалки «Добавить в плейлист» с её онбординг-обвязкой: строки, кнопки
 * «Создать плейлист» и «Сохранить» становятся целями спотлайта, а действие тура
 * ставит галочку «Избранных». Фича `add-to-playlist` об онбординге не знает — мост
 * живёт на слое страницы (dependency inversion).
 * @returns Модалку и открыватели добавления одной/всех проповедей.
 */
export const usePlaylistAddToPlaylist = () => {
  const { bindControls, renderCreateWrapper, renderRowWrapper, renderSaveWrapper } =
    useAddToPlaylistTour()

  return useAddToPlaylistModal({
    bindControls,
    renderCreateWrapper,
    renderRowWrapper,
    renderSaveWrapper,
  })
}
