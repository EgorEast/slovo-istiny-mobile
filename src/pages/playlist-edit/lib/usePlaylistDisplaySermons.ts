import { useAtom } from '@reatom/npm-react'
import { useMemo } from 'react'
import {
  buildLocalPlaylist,
  buildSermonIndex,
  type LocalPlaylistData,
  myPlaylistsAtom,
} from 'entities/playlist'
import { dynamicSectionsAtom } from 'entities/section'
import { type SermonShape } from 'shared/model'

/**
 * Проповеди плейлиста для экрана редактирования.
 *
 * Снапшот-плейлист отдаёт свои `sermons` как есть. У id-only плейлиста
 * (импорт из ссылки «только по id») снапшотов нет — те же `buildSermonIndex` +
 * `buildLocalPlaylist`, что и на экране плейлиста, резолвят id по локально
 * доступному каталогу; неизвестные id молча отбрасываются. Пустой плейлист
 * (нет ни снапшотов, ни резолвимых id) остаётся пустым.
 * @param playlist - Редактируемый локальный плейлист.
 * @returns Проповеди в порядке `sermonIds` для отображения и перестановки.
 */
export const usePlaylistDisplaySermons = (playlist: LocalPlaylistData): SermonShape[] => {
  const [sections] = useAtom(dynamicSectionsAtom)
  const [localPlaylists] = useAtom(myPlaylistsAtom)

  return useMemo(() => {
    if (playlist.sermons.length > 0) return playlist.sermons

    return buildLocalPlaylist(playlist, buildSermonIndex(sections, localPlaylists)).sermons
  }, [localPlaylists, playlist, sections])
}
