import { useCtx } from '@reatom/npm-react'
import { useCallback } from 'react'
import { type LocalPlaylistData, myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { applyAllMembership } from './applyAllMembership'
import { useMembershipDraftValues } from './useMembershipDraftValues'

/**
 * Черновик «все проповеди исходного плейлиста → целевые плейлисты». Плейлист
 * считается принадлежащим, когда содержит **все** исходные проповеди
 * (`isInitiallyContained`); включение добавляет недостающие, выключение —
 * убирает все. Сохранение читает `myPlaylistsAtom` в момент вызова, поэтому
 * работает по актуальным `sermonIds`.
 * @param playlist - Исходный плейлист (его `sermons` — снапшоты для добавления).
 * @returns Значения черновика, признак изменённости, переключатель и сохранение.
 */
export const useAllMembershipDraft = (playlist: PlaylistData) => {
  const ctx = useCtx()
  const sourceSermons = playlist.sermons
  const isInitiallyContained = useCallback(
    (target: LocalPlaylistData) =>
      sourceSermons.length > 0 &&
      sourceSermons.every(sermon => target.sermonIds.includes(sermon.id)),
    [sourceSermons],
  )
  const { changedValues, ...draft } = useMembershipDraftValues(isInitiallyContained)

  const save = useCallback(() => {
    void applyAllMembership(ctx, {
      changedValues,
      playlists: ctx.get(myPlaylistsAtom),
      sourceSermons,
    })
  }, [changedValues, ctx, sourceSermons])

  return { ...draft, save }
}
