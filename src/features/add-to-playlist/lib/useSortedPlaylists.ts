import { useAtom } from '@reatom/npm-react'
import { useMemo } from 'react'
import { type LocalPlaylistData, myPlaylistsAtom } from 'entities/playlist'

export interface PlaylistMembership {
  isContained: boolean
  playlist: LocalPlaylistData
}

/**
 * Держит список плейлистов с флагом принадлежности набора проповедей и сортирует
 * его: плейлисты, содержащие весь набор, идут первыми, остальные — после. Внутри
 * каждой группы сохраняется порядок `myPlaylistsAtom`, поэтому «Избранные»
 * (запиннены первыми в атоме) остаются первыми и в своей группе.
 *
 * Принадлежность здесь — снимок из атома на момент рендера: она задаёт начальное
 * значение черновика (см. `useMembershipDraft`/`useAllMembershipDraft`) и
 * блокировку заполненных плейлистов, а не отражает ещё не сохранённые правки.
 * @param sermonIds - Ids проповедей, чью совместную принадлежность показываем
 * (одна проповедь — `[sermon.id]`, пачка — ids исходного плейлиста).
 */
export const useSortedPlaylists = (sermonIds: string[]): PlaylistMembership[] => {
  const [playlists] = useAtom(myPlaylistsAtom)

  return useMemo(() => {
    const entries = playlists.map(playlist => ({
      isContained: sermonIds.length > 0 && sermonIds.every(id => playlist.sermonIds.includes(id)),
      playlist,
    }))
    const contained = entries.filter(entry => entry.isContained)
    const rest = entries.filter(entry => !entry.isContained)
    return [...contained, ...rest]
  }, [playlists, sermonIds])
}
