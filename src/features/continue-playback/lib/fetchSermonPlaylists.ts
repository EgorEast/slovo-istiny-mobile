import { validate as uuidValidate } from 'uuid'
import { mapPlaylistEntityToPlaylistData, type PlaylistData } from 'entities/playlist'
import { sermonsApi } from 'shared/api'

/**
 * Уточняет членства проповеди на сервере, когда в переданном объекте их нет.
 *
 * Членства могли не сохраниться в снапшоте/хранилище (старые записи, где
 * `playlists` вырезались) — поэтому, если локально их нет, для UUID-проповеди
 * запрашиваем её запись (`GET /sermons/{id}`) и мапим вложенные плейлисты в
 * `PlaylistData`. Ошибка сети/ненайденная проповедь — пустой список (вызывающий
 * трактует это как «кандидатов нет»).
 * @param sermonId - Id удаляемой проповеди.
 * @returns Плейлисты, в которых проповедь есть на сервере (или пустой список).
 */
export const fetchSermonPlaylists = async (sermonId: string): Promise<PlaylistData[]> => {
  if (!uuidValidate(sermonId)) return []

  try {
    const entity = await sermonsApi.getSermons().sermonControllerFindOne(sermonId)
    return (entity.playlists ?? []).map(mapPlaylistEntityToPlaylistData)
  } catch (error) {
    console.warn('[continue-playback] failed to fetch sermon memberships:', sermonId, error)
    return []
  }
}
