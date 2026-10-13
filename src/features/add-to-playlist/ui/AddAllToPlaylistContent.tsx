import { useMemo } from 'react'
import { type PlaylistData } from 'entities/playlist'
import { useAllMembershipDraft } from '../lib/useAllMembershipDraft'
import { useSortedPlaylists } from '../lib/useSortedPlaylists'
import { AddToPlaylistFooter } from './AddToPlaylistFooter'
import { PlaylistMembershipList } from './PlaylistMembershipList'

/**
 * Содержимое модалки для пачки «все проповеди исходного плейлиста»: чекбокс
 * включён, когда целевой плейлист содержит **все** исходные проповеди.
 * @param root0 - Пропсы содержимого.
 * @param root0.onClose - Закрыть модалку (после сохранения или отмены).
 * @param root0.playlist - Исходный плейлист (снапшоты проповедей для добавления).
 */
export const AddAllToPlaylistContent = ({
  onClose,
  playlist,
}: {
  onClose: () => void
  playlist: PlaylistData
}) => {
  const sourceSermonIds = useMemo(
    () => playlist.sermons.map(sermon => sermon.id),
    [playlist.sermons],
  )
  const items = useSortedPlaylists(sourceSermonIds)
  const { isDirty, save, toggle, values } = useAllMembershipDraft(playlist)

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
