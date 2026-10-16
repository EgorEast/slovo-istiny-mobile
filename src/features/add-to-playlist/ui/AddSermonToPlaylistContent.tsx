import { useMemo } from 'react'
import { type SermonData } from 'entities/sermon'
import { type AddToPlaylistBindings } from '../lib/addToPlaylistControls'
import { useAddToPlaylistControls } from '../lib/useAddToPlaylistControls'
import { useMembershipDraft } from '../lib/useMembershipDraft'
import { useSortedPlaylists } from '../lib/useSortedPlaylists'
import { AddToPlaylistFooter } from './AddToPlaylistFooter'
import { PlaylistMembershipList } from './PlaylistMembershipList'

/**
 * Содержимое модалки для одной проповеди: мультивыбор плейлистов по черновику.
 * @param root0 - Пропсы содержимого.
 * @param root0.bindControls - Отдаёт владельцу управление выбором.
 * @param root0.onClose - Закрыть модалку (после сохранения или отмены).
 * @param root0.renderRowWrapper - Оборачивает строку плейлиста.
 * @param root0.renderSaveWrapper - Оборачивает кнопку «Сохранить».
 * @param root0.sermon - Проповедь (id для принадлежности, снапшот для добавления).
 */
export const AddSermonToPlaylistContent = ({
  bindControls,
  onClose,
  renderRowWrapper,
  renderSaveWrapper,
  sermon,
}: AddToPlaylistBindings & {
  onClose: () => void
  sermon: SermonData
}) => {
  const sermonIds = useMemo(() => [sermon.id], [sermon.id])
  const items = useSortedPlaylists(sermonIds)
  const { isDirty, save, setChecked, toggle, values } = useMembershipDraft(sermon)

  useAddToPlaylistControls(bindControls, setChecked)

  const handleSave = () => {
    save()
    onClose()
  }

  return (
    <>
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
    </>
  )
}
