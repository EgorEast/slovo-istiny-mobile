import { useAction, useAtom } from '@reatom/npm-react'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { createLocalPlaylist, loadMyPlaylists, myPlaylistsLoadedAtom } from 'entities/playlist'

/**
 * Состояние формы создания локального плейлиста.
 *
 * Название обязательно: пока оно пустое/пробельное, `canSubmit` = false.
 * Отправка гидратирует `myPlaylistsAtom` (`loadMyPlaylists`), если он ещё не
 * загружен, — иначе `createLocalPlaylist` прочитал бы негидратированный атом и
 * результат перезаписался бы в полёте гидратации. Затем создаёт плейлист без
 * проповедей, закрывает форму и уводит на экран созданного плейлиста. Плейлист
 * локальный — сервер не задействован.
 * @param onClose - Закрыть форму после успешного создания.
 * @returns Значение и сеттер названия, доступность отправки и обработчик.
 */
export const useCreateLocalPlaylistForm = (onClose: () => void) => {
  const router = useRouter()
  const createPlaylist = useAction(createLocalPlaylist)
  const loadPlaylists = useAction(loadMyPlaylists)
  const [isLoaded] = useAtom(myPlaylistsLoadedAtom)
  const [title, setTitle] = useState('')

  const trimmedTitle = title.trim()
  const canSubmit = trimmedTitle.length > 0

  const submit = useCallback(async () => {
    if (!canSubmit) return
    if (!isLoaded) await loadPlaylists()
    const created = await createPlaylist({ sermonIds: [], title: trimmedTitle })
    onClose()
    router.push({ params: { playlist: created.id }, pathname: '/listen/playlist' })
  }, [canSubmit, createPlaylist, isLoaded, loadPlaylists, onClose, router, trimmedTitle])

  return { canSubmit, setTitle, submit, title }
}
