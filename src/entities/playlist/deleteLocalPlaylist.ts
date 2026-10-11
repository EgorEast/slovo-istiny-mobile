import { action } from '@reatom/framework'
import { FAVORITES_PLAYLIST, withFavoritesFirst } from './localPlaylists'
import { persistMyPlaylists } from './localPlaylistStorage'
import { myPlaylistsAtom } from './model'

/**
 * Удаляет локальный (пользовательский) плейлист.
 *
 * Обновляет `myPlaylistsAtom` (read-modify-write по id) и персистит результат
 * тем же путём, что `createLocalPlaylist`/`reorderMyPlaylists`. «Избранные»
 * удалить нельзя, неизвестный id — no-op. Чтение атома → вычисление
 * `nextPlaylists` → коммит идут без `await` между ними, поэтому конкурентные
 * операции не теряют изменения друг друга. Отказ записи логируется, но атом
 * уже закоммичен — та же политика деградации, что и у остальных мутаций.
 * @param playlistId - Идентификатор удаляемого плейлиста.
 * @returns Обновлённый список плейлистов.
 */
export const deleteLocalPlaylist = action(async (ctx, playlistId: string) => {
  const playlists = ctx.get(myPlaylistsAtom)
  const target = playlists.find(playlist => playlist.id === playlistId)
  if (!target || target.id === FAVORITES_PLAYLIST.id) return playlists

  const nextPlaylists = withFavoritesFirst(playlists.filter(playlist => playlist.id !== playlistId))

  await ctx.schedule(() => {
    myPlaylistsAtom(ctx, nextPlaylists)
  })
  try {
    await persistMyPlaylists(nextPlaylists)
  } catch (error) {
    console.error('[deleteLocalPlaylist] failed to persist deletion:', error)
  }
  return nextPlaylists
}, 'deleteLocalPlaylist')
