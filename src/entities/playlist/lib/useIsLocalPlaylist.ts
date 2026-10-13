import { useAtom } from '@reatom/npm-react'
import { useMemo } from 'react'
import { myPlaylistsAtom } from '../model'

/**
 * «Локальный» плейлист — тот, что присутствует в «Мои плейлисты»
 * (`myPlaylistsAtom`): «Избранные» (засеяны всегда), импортированные из ссылки
 * и созданные вручную (в том числе с uuid-идентификатором, неотличимым от
 * серверного). Источник истины — членство в атоме, а не форма id.
 * @param playlistId - Идентификатор плейлиста.
 * @returns `true`, если плейлист есть в «Мои плейлисты».
 */
export const useIsLocalPlaylist = (playlistId: string): boolean => {
  const [playlists] = useAtom(myPlaylistsAtom)

  return useMemo(
    () => playlists.some(playlist => playlist.id === playlistId),
    [playlistId, playlists],
  )
}
