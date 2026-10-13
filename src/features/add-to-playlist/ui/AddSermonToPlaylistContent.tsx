import { useMemo } from 'react'
import { type SermonData } from 'entities/sermon'
import { useMembershipDraft } from '../lib/useMembershipDraft'
import { useSortedPlaylists } from '../lib/useSortedPlaylists'
import { AddToPlaylistFooter } from './AddToPlaylistFooter'
import { PlaylistMembershipList } from './PlaylistMembershipList'

/**
 * Содержимое модалки для одной проповеди: мультивыбор плейлистов по черновику.
 * @param root0 - Пропсы содержимого.
 * @param root0.onClose - Закрыть модалку (после сохранения или отмены).
 * @param root0.sermon - Проповедь (id для принадлежности, снапшот для добавления).
 */
export const AddSermonToPlaylistContent = ({
  onClose,
  sermon,
}: {
  onClose: () => void
  sermon: SermonData
}) => {
  const sermonIds = useMemo(() => [sermon.id], [sermon.id])
  const items = useSortedPlaylists(sermonIds)
  const { isDirty, save, toggle, values } = useMembershipDraft(sermon)

  const handleSave = () => {
    save()
    onClose()
  }

  return (
    <>
      <PlaylistMembershipList items={items} values={values} onToggle={toggle} />
      <AddToPlaylistFooter onCancel={onClose} disabled={!isDirty} onSave={handleSave} />
    </>
  )
}
