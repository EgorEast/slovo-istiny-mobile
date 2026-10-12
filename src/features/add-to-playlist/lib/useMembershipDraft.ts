import { useAtom, useCtx } from '@reatom/npm-react'
import { useCallback, useMemo, useState } from 'react'
import { myPlaylistsAtom, togglePlaylistSermon } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'

/**
 * Черновик принадлежности проповеди локальным плейлистам. Чекбоксы меняют только
 * черновик (`values`), не трогая `myPlaylistsAtom`: изменения применяются лишь по
 * «Сохранить» (`save`), а «Отмена» их отбрасывает. Начальные значения берутся из
 * атома по `sermon.id` («Избранные» включены — как и любой другой плейлист).
 * @param sermon - Проповедь (id для принадлежности, снапшот для добавления).
 * @returns Значения черновика, признак изменённости, переключатель и сохранение.
 */
export const useMembershipDraft = (sermon: SermonData) => {
  const ctx = useCtx()
  const [playlists] = useAtom(myPlaylistsAtom)
  const initialValues = useMemo(
    () =>
      playlists.reduce<Record<string, boolean>>((accumulator, playlist) => {
        accumulator[playlist.id] = playlist.sermonIds.includes(sermon.id)
        return accumulator
      }, {}),
    [playlists, sermon.id],
  )
  const [changedValues, setChangedValues] = useState<Record<string, boolean>>({})

  const values = useMemo(
    () => ({ ...initialValues, ...changedValues }),
    [changedValues, initialValues],
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

  const save = useCallback(() => {
    for (const [playlistId, value] of Object.entries(changedValues))
      void togglePlaylistSermon(ctx, playlistId, sermon, value)
  }, [changedValues, ctx, sermon])

  return { isDirty: Object.keys(changedValues).length > 0, save, toggle, values }
}
