import { useAtom } from '@reatom/npm-react'
import { useCallback, useMemo, useState } from 'react'
import { type LocalPlaylistData, myPlaylistsAtom } from 'entities/playlist'

/**
 * Общий черновик принадлежности «плейлист → boolean»: начальные значения
 * задаёт предикат `isInitiallyContained`, чекбоксы меняют только `values`, а
 * «изменённость» (`isDirty`) считается по отличиям от начальных значений.
 * Общий слой для одной проповеди (`useMembershipDraft`) и пачки проповедей
 * (`useAllMembershipDraft`); сохранение каждый хук определяет сам.
 * @param isInitiallyContained - Начальная принадлежность плейлиста (должна быть
 * стабильной по ссылке — оберните в `useCallback`).
 * @returns Значения черновика, его изменённость, переключатель, точечная
 * установка значения и «сырые» правки.
 */
export const useMembershipDraftValues = (
  isInitiallyContained: (playlist: LocalPlaylistData) => boolean,
) => {
  const [playlists] = useAtom(myPlaylistsAtom)
  const initialValues = useMemo(
    () =>
      playlists.reduce<Record<string, boolean>>((accumulator, playlist) => {
        accumulator[playlist.id] = isInitiallyContained(playlist)
        return accumulator
      }, {}),
    [isInitiallyContained, playlists],
  )
  const [changedValues, setChangedValues] = useState<Record<string, boolean>>({})

  const values = useMemo(
    () => ({ ...initialValues, ...changedValues }),
    [changedValues, initialValues],
  )

  // Точечная установка значения (тур ставит галочку программно): тот же инвариант
  // «правка живёт только пока отличается от начальной», что и у `toggle`.
  const setChecked = useCallback(
    (playlistId: string, checked: boolean) => {
      setChangedValues(current => {
        const next = { ...current }
        if (checked === initialValues[playlistId]) delete next[playlistId]
        else next[playlistId] = checked
        return next
      })
    },
    [initialValues],
  )

  const toggle = useCallback(
    (playlistId: string) => {
      setChangedValues(current => {
        const nextValue = !(current[playlistId] ?? initialValues[playlistId])
        const next = { ...current }
        if (nextValue === initialValues[playlistId]) delete next[playlistId]
        else next[playlistId] = nextValue
        return next
      })
    },
    [initialValues],
  )

  return {
    changedValues,
    isDirty: Object.keys(changedValues).length > 0,
    setChecked,
    toggle,
    values,
  }
}
