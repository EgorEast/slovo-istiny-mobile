import { useAction, useAtom } from '@reatom/npm-react'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  loadMyPlaylists,
  type LocalPlaylistData,
  myPlaylistsLoadedAtom,
  renameLocalPlaylist,
  reorderLocalPlaylistSermons,
} from 'entities/playlist'
import { hasOrderChanged } from 'shared/lib/utils/hasOrderChanged'
import { type SermonShape } from 'shared/model'

/**
 * Состояние экрана редактирования локального плейлиста.
 *
 * Держит локальные копии названия и порядка проповедей, инициализированные из
 * плейлиста. «Сохранить» доступно, только когда название непустое и изменено
 * название **или** порядок. Сохранение при необходимости гидратирует
 * `myPlaylistsAtom` (`loadMyPlaylists`), затем вызывает переименование и/или
 * reorder (только изменившиеся части), после чего `router.back()`. Экран
 * монтируется лишь когда плейлист найден, поэтому локальные копии не
 * рассинхронизируются с асинхронной гидратацией атома.
 * @param playlist - Редактируемый локальный плейлист.
 * @param displaySermons - Проповеди в порядке `sermonIds` (у id-only плейлиста —
 * резолвленные) — база для отображения и детекта изменения порядка.
 * @returns Значение/сеттер названия, порядок и его сеттер, доступность и обработчик сохранения.
 */
export const usePlaylistEditForm = (playlist: LocalPlaylistData, displaySermons: SermonShape[]) => {
  const router = useRouter()
  const rename = useAction(renameLocalPlaylist)
  const reorder = useAction(reorderLocalPlaylistSermons)
  const loadPlaylists = useAction(loadMyPlaylists)
  const [isLoaded] = useAtom(myPlaylistsLoadedAtom)
  const [title, setTitle] = useState(playlist.title)
  const [orderedSermons, setOrderedSermons] = useState<SermonShape[]>(displaySermons)

  const trimmedTitle = title.trim()
  const isTitleChanged = trimmedTitle !== playlist.title.trim()
  const isOrderChanged = hasOrderChanged(displaySermons, orderedSermons)
  const canSave = trimmedTitle.length > 0 && (isTitleChanged || isOrderChanged)

  const save = useCallback(async () => {
    if (!canSave) return
    if (!isLoaded) await loadPlaylists()

    if (isTitleChanged) await rename(playlist.id, trimmedTitle)
    if (isOrderChanged)
      await reorder(
        playlist.id,
        orderedSermons.map(sermon => sermon.id),
      )
    router.back()
  }, [
    canSave,
    isLoaded,
    isOrderChanged,
    isTitleChanged,
    loadPlaylists,
    orderedSermons,
    playlist.id,
    rename,
    reorder,
    router,
    trimmedTitle,
  ])

  return { canSave, orderedSermons, save, setOrderedSermons, setTitle, title }
}
