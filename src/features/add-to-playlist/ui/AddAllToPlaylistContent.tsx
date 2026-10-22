import { useMemo } from 'react'
import { type PlaylistData } from 'entities/playlist'
import { type AddToPlaylistBindings } from '../lib/addToPlaylistControls'
import { useAddToPlaylistControls } from '../lib/useAddToPlaylistControls'
import { useAllMembershipDraft } from '../lib/useAllMembershipDraft'
import { useSortedPlaylists } from '../lib/useSortedPlaylists'
import { AddToPlaylistBody } from './AddToPlaylistBody'
import { AddToPlaylistFooter } from './AddToPlaylistFooter'
import { PlaylistMembershipList } from './PlaylistMembershipList'

/**
 * Содержимое модалки для пачки «все проповеди исходного плейлиста»: чекбокс
 * включён, когда целевой плейлист содержит **все** исходные проповеди.
 * @param root0 - Пропсы содержимого.
 * @param root0.bindControls - Отдаёт владельцу управление выбором.
 * @param root0.onClose - Закрыть модалку (после сохранения или отмены).
 * @param root0.playlist - Исходный плейлист (снапшоты проповедей для добавления).
 * @param root0.renderCreateWrapper - Оборачивает кнопку «Создать плейлист».
 * @param root0.renderRowWrapper - Оборачивает строку плейлиста.
 * @param root0.renderSaveWrapper - Оборачивает кнопку «Сохранить».
 */
export const AddAllToPlaylistContent = ({
  bindControls,
  onClose,
  playlist,
  renderCreateWrapper,
  renderRowWrapper,
  renderSaveWrapper,
}: AddToPlaylistBindings & {
  onClose: () => void
  playlist: PlaylistData
}) => {
  const sourceSermonIds = useMemo(
    () => playlist.sermons.map(sermon => sermon.id),
    [playlist.sermons],
  )
  const items = useSortedPlaylists(sourceSermonIds)
  const { isDirty, save, setChecked, toggle, values } = useAllMembershipDraft(playlist)

  useAddToPlaylistControls(bindControls, setChecked)

  const handleSave = () => {
    save()
    onClose()
  }

  return (
    <AddToPlaylistBody renderCreateWrapper={renderCreateWrapper}>
      <PlaylistMembershipList
        items={items}
        values={values}
        onToggle={toggle}
        renderRowWrapper={renderRowWrapper}
      />
      <AddToPlaylistFooter
        onCancel={onClose}
        disabled={!isDirty}
        onSave={handleSave}
        renderSaveWrapper={renderSaveWrapper}
      />
    </AddToPlaylistBody>
  )
}
