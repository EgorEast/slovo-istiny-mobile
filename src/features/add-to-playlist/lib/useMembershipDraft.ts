import { useCtx } from '@reatom/npm-react'
import { useCallback } from 'react'
import { type LocalPlaylistData, togglePlaylistSermon } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { useMembershipDraftValues } from './useMembershipDraftValues'

/**
 * Черновик принадлежности одной проповеди локальным плейлистам. Чекбоксы меняют
 * только черновик (`values`), не трогая `myPlaylistsAtom`: изменения применяются
 * лишь по «Сохранить» (`save`), а «Отмена» их отбрасывает. Начальные значения
 * берутся из атома по `sermon.id` («Избранные» включены — как и любой другой
 * плейлист).
 * @param sermon - Проповедь (id для принадлежности, снапшот для добавления).
 * @returns Значения черновика, признак изменённости, переключатель и сохранение.
 */
export const useMembershipDraft = (sermon: SermonData) => {
  const ctx = useCtx()
  const isInitiallyContained = useCallback(
    (playlist: LocalPlaylistData) => playlist.sermonIds.includes(sermon.id),
    [sermon.id],
  )
  const { changedValues, ...draft } = useMembershipDraftValues(isInitiallyContained)

  const save = useCallback(() => {
    for (const [playlistId, value] of Object.entries(changedValues))
      void togglePlaylistSermon(ctx, playlistId, sermon, value)
  }, [changedValues, ctx, sermon])

  return { ...draft, save }
}
