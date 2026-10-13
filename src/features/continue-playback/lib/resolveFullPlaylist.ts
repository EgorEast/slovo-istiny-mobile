import { type Ctx } from '@reatom/framework'
import { validate as uuidValidate } from 'uuid'
import { mapPlaylistEntityToPlaylistData, type PlaylistData } from 'entities/playlist'
import { dynamicSectionsAtom, getCachedSections, type SectionData } from 'entities/section'
import { playlistsApi } from 'shared/api'

const findInSections = (sections: SectionData[], playlistId: string): PlaylistData | undefined =>
  sections.flatMap(section => section.playlists ?? []).find(playlist => playlist.id === playlistId)

/**
 * Разворачивает лёгкий реф плейлиста (`sermons: []`) в полный плейлист, чтобы
 * очередь и автопереход работали: загруженные секции → кеш секций → API (только
 * для UUID) → сам лёгкий реф как фолбэк. Полный плейлист (`sermons.length > 0`)
 * возвращается как есть.
 * @param ctx - Reatom-контекст (чтение `dynamicSectionsAtom`).
 * @param playlist - Выбранный кандидат (возможно, лёгкий реф без очереди).
 * @returns Полный плейлист или исходный лёгкий реф, если развернуть не удалось.
 */
export const resolveFullPlaylist = async (
  ctx: Ctx,
  playlist: PlaylistData,
): Promise<PlaylistData> => {
  if (playlist.sermons.length > 0) return playlist

  const live = findInSections(ctx.get(dynamicSectionsAtom), playlist.id)
  if (live) return live

  const cached = await getCachedSections().catch(() => undefined)
  const fromCache = cached ? findInSections(cached, playlist.id) : undefined
  if (fromCache) return fromCache

  if (!uuidValidate(playlist.id)) return playlist

  try {
    const entity = await playlistsApi.getPlaylists().playlistControllerFindOne(playlist.id)
    return mapPlaylistEntityToPlaylistData(entity)
  } catch (error) {
    console.warn('[continue-playback] failed to resolve playlist:', playlist.id, error)
    return playlist
  }
}
