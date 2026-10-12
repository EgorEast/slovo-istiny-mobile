import { action } from '@reatom/framework'
import { FAVORITES_PLAYLIST, withFavoritesFirst } from './localPlaylists'
import { persistMyPlaylists } from './localPlaylistStorage'
import { myPlaylistsAtom } from './model'

/**
 * Очищает локальный (пользовательский) плейлист от всех проповедей.
 *
 * «Очистить» доступен только кастомным плейлистам, не «Избранным»: favorites
 * отсекается guard'ом и возвращается без изменений (no-op). Обновляет
 * `myPlaylistsAtom` (read-modify-write по id: `sermonIds`/`sermons` → пустые
 * массивы) и персистит результат тем же путём, что `deleteLocalPlaylist`/
 * `togglePlaylistSermon`. Чтение атома → вычисление `nextPlaylists` → коммит
 * идут без `await` между ними, поэтому конкурентные операции не теряют
 * изменения друг друга. Неизвестный id — no-op. Отказ записи логируется, но
 * атом уже закоммичен — та же политика деградации.
 * @param playlistId - Идентификатор очищаемого плейлиста.
 * @returns Обновлённый список плейлистов.
 */
export const clearLocalPlaylistSermons = action(async (ctx, playlistId: string) => {
  const playlists = ctx.get(myPlaylistsAtom)
  const target = playlists.find(playlist => playlist.id === playlistId)
  if (!target || target.id === FAVORITES_PLAYLIST.id) return playlists

  const nextPlaylists = withFavoritesFirst(
    playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, sermonIds: [], sermons: [] } : playlist,
    ),
  )

  await ctx.schedule(() => {
    myPlaylistsAtom(ctx, nextPlaylists)
  })
  try {
    await persistMyPlaylists(nextPlaylists)
  } catch (error) {
    console.error('[clearLocalPlaylistSermons] failed to persist clearing:', error)
  }
  return nextPlaylists
}, 'clearLocalPlaylistSermons')
