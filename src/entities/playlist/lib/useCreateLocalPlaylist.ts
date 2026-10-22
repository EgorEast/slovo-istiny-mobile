import { useAction, useAtom } from '@reatom/npm-react'
import { useCallback, useState } from 'react'
import { createLocalPlaylist } from '../createLocalPlaylist'
import { type LocalPlaylistData } from '../localPlaylists'
import { loadMyPlaylists, myPlaylistsLoadedAtom } from '../model'

/**
 * Состояние формы создания локального плейлиста.
 *
 * Название обязательно: пока оно пустое/пробельное, `canSubmit` = false.
 * Отправка гидратирует `myPlaylistsAtom` (`loadMyPlaylists`), если он ещё не
 * загружен, — иначе `createLocalPlaylist` прочитал бы негидратированный атом и
 * результат перезаписался бы в полёте гидратации. Затем создаёт плейлист без
 * проповедей и отдаёт его в `onCreated`; навигация и закрытие формы — забота
 * вызывающего кода. Повторная отправка заблокирована, пока идёт текущая
 * (`submitting`). Плейлист локальный — сервер не задействован.
 * @param onCreated - Получает созданный плейлист (например, чтобы закрыть форму).
 * @returns Значение и сеттер названия, доступность/признак отправки и обработчик.
 */
export const useCreateLocalPlaylist = (onCreated: (created: LocalPlaylistData) => void) => {
  const createPlaylist = useAction(createLocalPlaylist)
  const loadPlaylists = useAction(loadMyPlaylists)
  const [isLoaded] = useAtom(myPlaylistsLoadedAtom)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')

  const trimmedTitle = title.trim()
  const canSubmit = trimmedTitle.length > 0

  const submit = useCallback(async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      if (!isLoaded) await loadPlaylists()
      const created = await createPlaylist({ sermonIds: [], title: trimmedTitle })
      onCreated(created)
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, createPlaylist, isLoaded, loadPlaylists, onCreated, submitting, trimmedTitle])

  return { canSubmit, setTitle, submit, submitting, title }
}
