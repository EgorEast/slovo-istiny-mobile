import { action } from '@reatom/framework'
import { FAVORITES_PLAYLIST, withFavoritesFirst } from './localPlaylists'
import { persistMyPlaylists } from './localPlaylistStorage'
import { myPlaylistsAtom } from './model'

/**
 * Переименовывает локальный (пользовательский) плейлист.
 *
 * Обновляет `myPlaylistsAtom` (read-modify-write по id) и персистит результат
 * тем же путём, что `createLocalPlaylist`/`reorderMyPlaylists`. «Избранные» и
 * неизвестный id — no-op: системный плейлист переименовать нельзя. Чтение
 * атома → вычисление `nextPlaylists` → коммит идут без `await` между ними,
 * поэтому конкурентные операции не теряют изменения друг друга. Отказ записи
 * логируется, но атом уже закоммичен — та же политика деградации, что и у
 * остальных мутаций.
 * @param playlistId - Идентификатор переименовываемого плейлиста.
 * @param title - Новое название (уже обрезанное вызывающим).
 * @returns Обновлённый список плейлистов.
 */
export const renameLocalPlaylist = action(async (ctx, playlistId: string, title: string) => {
  const playlists = ctx.get(myPlaylistsAtom)
  const target = playlists.find(playlist => playlist.id === playlistId)
  if (!target || target.id === FAVORITES_PLAYLIST.id) return playlists

  const nextPlaylists = withFavoritesFirst(
    playlists.map(playlist => (playlist.id === playlistId ? { ...playlist, title } : playlist)),
  )

  await ctx.schedule(() => {
    myPlaylistsAtom(ctx, nextPlaylists)
  })
  try {
    await persistMyPlaylists(nextPlaylists)
  } catch (error) {
    console.error('[renameLocalPlaylist] failed to persist title:', error)
  }
  return nextPlaylists
}, 'renameLocalPlaylist')
