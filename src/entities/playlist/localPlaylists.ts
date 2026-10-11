import z from 'zod'
import { type SermonShape } from 'shared/model'
import { localSermonSchema } from './lib/localSermonSchema'

/** Ключ AsyncStorage для локальных плейлистов. */
export const MY_PLAYLISTS = 'myPlaylists'

/**
 * Максимум проповедей в пользовательском (локальном) плейлисте.
 *
 * Ограничение продиктовано бюджетом URL: плейлист целиком уезжает в ссылку
 * `?sermons=<base64url>` (16 байт на UUID → 22 символа), и 200 проповедей — это
 * ~4.4 КБ query-строки, комфортно укладывающиеся в лимиты браузеров/мессенджеров
 * (практический предел URL — ~8 КБ). Заодно защищает `myPlaylists` от
 * бесконтрольного роста одной записи.
 */
export const MAX_CUSTOM_PLAYLIST_SERMONS = 200

/**
 * Черновик локального плейлиста на границе хранилища.
 *
 * `sermons`/`sermonIds` необязательны: старые записи содержали только
 * `sermonIds`, а самые ранние — только `id`/`title`. Канонический вид
 * (`LocalPlaylistData`) получается через `normalizeLocalPlaylist`.
 */
const localPlaylistDraftSchema = z.object({
  id: z.string(),
  sermonIds: z.array(z.string()).optional(),
  sermons: z.array(localSermonSchema).optional(),
  title: z.string(),
})

export const myPlaylistsArraySchema = z.array(localPlaylistDraftSchema)

/**
 * Канонический локальный (созданный пользователем) плейлист.
 *
 * Хранит снапшоты проповедей (`sermons`), а не только id: снапшот делает
 * плейлист рендерящимся и проигрываемым офлайн, без обращения к каталогу.
 * `sermonIds` — авторитетный список id-участников (ведётся напрямую; у
 * импортированного из ссылки плейлиста может содержать id без снапшота).
 */
export interface LocalPlaylistData {
  id: string
  sermonIds: string[]
  sermons: SermonShape[]
  title: string
}

// Недоверенный список участников может нести дубликаты и пустые строки.
const toUniqueSermonIds = (ids: string[]): string[] => [...new Set(ids.filter(id => id.length > 0))]

/**
 * Приводит прочитанные (недоверенные) данные плейлиста к каноническому виду.
 *
 * `sermonIds` — авторитетный список участников: он берётся как есть
 * (дедуплицированный, без пустых строк), а `sermons` — снапшот-подмножество,
 * из которого отбрасываются снапшоты для id, которых больше нет среди
 * участников. Так id-only участники импортированного из ссылки плейлиста
 * переживают перезагрузку. Список участников выводится из снапшотов только у
 * legacy-записи без `sermonIds` (самые ранние хранили одни `sermons`).
 * @param playlist - Сырые данные из схемы (untrusted).
 * @returns Плейлист с авторитетными `sermonIds` и согласованными `sermons`.
 */
export const normalizeLocalPlaylist = (
  playlist: z.infer<typeof localPlaylistDraftSchema>,
): LocalPlaylistData => {
  const sermons = playlist.sermons ?? []
  const storedSermonIds = toUniqueSermonIds(playlist.sermonIds ?? [])
  const sermonIds =
    storedSermonIds.length > 0
      ? storedSermonIds
      : toUniqueSermonIds(sermons.map(sermon => sermon.id))
  const memberIds = new Set(sermonIds)

  return {
    id: playlist.id,
    sermonIds,
    sermons: sermons.filter(sermon => memberIds.has(sermon.id)),
    title: playlist.title,
  }
}

// Плоский id: серверные id — UUID, столкновение с `favorites` невозможно.
const FAVORITES_PLAYLIST_ID = 'favorites'

/** Плейлист «Избранные»: всегда присутствует и стоит первым в списке. */
export const FAVORITES_PLAYLIST: LocalPlaylistData = {
  id: FAVORITES_PLAYLIST_ID,
  sermonIds: [],
  sermons: [],
  title: 'Избранные',
}

// Приводит список к инварианту «Избранные всегда первые».
//
// Первое stored-«Избранное» сохраняется как есть (его снапшоты не теряются при
// гидратации и reorder); пустая константа — только фолбэк, когда записи нет.
// Дубликаты favorites id отбрасываются: побеждает первый.
export const withFavoritesFirst = (playlists: LocalPlaylistData[]): LocalPlaylistData[] => {
  const storedFavorites = playlists.find(playlist => playlist.id === FAVORITES_PLAYLIST_ID)
  const others = playlists.filter(playlist => playlist.id !== FAVORITES_PLAYLIST_ID)
  return [storedFavorites ?? FAVORITES_PLAYLIST, ...others]
}
