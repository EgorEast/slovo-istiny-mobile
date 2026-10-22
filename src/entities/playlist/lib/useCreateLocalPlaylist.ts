import { useAction, useAtom } from '@reatom/npm-react'
import { useCallback, useRef, useState } from 'react'
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
 * вызывающего кода. Повторная отправка заблокирована, пока идёт текущая: синхронный
 * ref-guard отсекает второй тап в том же кадре (до коммита `submitting`), а
 * `submitting` управляет disabled-состоянием кнопки. Плейлист локальный — сервер не
 * задействован.
 * @param onCreated - Получает созданный плейлист (например, чтобы закрыть форму).
 * @returns Значение и сеттер названия, доступность/признак отправки и обработчик.
 */
export const useCreateLocalPlaylist = (onCreated: (created: LocalPlaylistData) => void) => {
  const createPlaylist = useAction(createLocalPlaylist)
  const loadPlaylists = useAction(loadMyPlaylists)
  const [isLoaded] = useAtom(myPlaylistsLoadedAtom)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [title, setTitle] = useState('')

  const trimmedTitle = title.trim()
  const canSubmit = trimmedTitle.length > 0

  const submit = useCallback(async () => {
    if (!canSubmit || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      if (!isLoaded) await loadPlaylists()
      const created = await createPlaylist({ sermonIds: [], title: trimmedTitle })
      onCreated(created)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [canSubmit, createPlaylist, isLoaded, loadPlaylists, onCreated, trimmedTitle])

  return { canSubmit, setTitle, submit, submitting, title }
}
