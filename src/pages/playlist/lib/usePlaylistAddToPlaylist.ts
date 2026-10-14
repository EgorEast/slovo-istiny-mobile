import { useAddToPlaylistModal } from 'features/add-to-playlist'
import { useAddToPlaylistTour } from './useAddToPlaylistTour'

/**
 * Композиция модалки «Добавить в плейлист» с её онбординг-обвязкой: строки и
 * кнопка «Сохранить» становятся целями спотлайта, а действие тура ставит галочку
 * «Избранных». Фича `add-to-playlist` об онбординге не знает — мост живёт на слое
 * страницы (dependency inversion).
 * @returns Модалку и открыватели добавления одной/всех проповедей.
 */
export const usePlaylistAddToPlaylist = () => {
  const { bindControls, renderRowWrapper, renderSaveWrapper } = useAddToPlaylistTour()

  return useAddToPlaylistModal({ bindControls, renderRowWrapper, renderSaveWrapper })
}
