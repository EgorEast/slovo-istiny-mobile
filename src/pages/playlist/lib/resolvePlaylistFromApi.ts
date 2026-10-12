import axios from 'axios'
import { validate as uuidValidate } from 'uuid'
import { mapPlaylistEntityToPlaylistData, type PlaylistData } from 'entities/playlist'
import { playlistsApi } from 'shared/api'

export const resolvePlaylistFromApi = async (
  playlistId: string,
): Promise<PlaylistData | undefined> => {
  // id приходит из внешнего URL-query (?playlist=...), поэтому перед подстановкой
  // в путь API (/playlists/{id}) он обязан выглядеть как UUID. Malformed-ссылка —
  // ожидаемый вход: не звоним в сеть, резолвимся в notFound (см. docs/features/deep-links.md).
  if (!uuidValidate(playlistId)) return undefined

  try {
    const entity = await playlistsApi.getPlaylists().playlistControllerFindOne(playlistId)
    return mapPlaylistEntityToPlaylistData(entity)
  } catch (error) {
    // INTENTIONAL collapse: любая ошибка сетевого уровня резолвится в notFound в UI
    // (см. docs/features/deep-links.md) — контракт не бросаем, ошибки видны только в логах.
    // Ожидаемый источник — смена сервера после импорта бэкапа (`settings.serverUrl`):
    // открытая страница плейлиста резолвит старый UUID против нового сервера и получает
    // 5xx, поэтому пишем warn, а не error — иначе штатный сценарий выглядит как поломка.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn('resolvePlaylistFromApi: playlist not found:', playlistId)
      return undefined
    }
    console.warn(
      'resolvePlaylistFromApi: playlist unavailable:',
      playlistId,
      axios.isAxiosError(error) ? error.response?.status : undefined,
    )
    return undefined
  }
}
