import { action } from '@reatom/framework'
import { FAVORITES_PLAYLIST, type LocalPlaylistData, withFavoritesFirst } from './localPlaylists'
import { persistMyPlaylists } from './localPlaylistStorage'
import { myPlaylistsAtom } from './model'

/**
 * Приводит список объектов к порядку `orderedIds`.
 *
 * Id из `orderedIds`, которых нет среди `items`, молча отбрасываются; элементы,
 * которых нет в `orderedIds`, дописываются в конец — конкурентное добавление
 * проповеди не теряется.
 * @param items - Элементы для перестановки.
 * @param orderedIds - Желаемый порядок id.
 * @returns Новый массив в заданном порядке.
 */
const permuteById = <T extends { id: string }>(items: T[], orderedIds: string[]): T[] => {
  const byId = new Map(items.map(item => [item.id, item]))
  const ordered = orderedIds.flatMap(id => {
    const item = byId.get(id)
    return item ? [item] : []
  })
  const seen = new Set(ordered.map(item => item.id))
  const missing = items.filter(item => !seen.has(item.id))
  return [...ordered, ...missing]
}

/**
 * Переупорядочивает проповеди локального (пользовательского) плейлиста.
 *
 * Обновляет `myPlaylistsAtom` (read-modify-write по id) и персистит результат
 * тем же путём, что `reorderMyPlaylists`. Перестановка применяется сразу к
 * снапшотам `sermons` и к производным `sermonIds`, чтобы порядок на экране
 * плейлиста совпал с порядком на экране редактирования. Для плейлиста «только
 * по id» (импорт из ссылки, снапшотов нет) переставляются только `sermonIds`.
 * «Избранные» и неизвестный id — no-op. Чтение атома → вычисление
 * `nextPlaylists` → коммит идут без `await` между ними, поэтому конкурентные
 * операции не теряют изменения друг друга. Отказ записи логируется, но атом
 * уже закоммичен — та же политика деградации, что у остальных мутаций.
 * @param playlistId - Идентификатор плейлиста.
 * @param sermonIds - Желаемый порядок id проповедей.
 * @returns Обновлённый список плейлистов.
 */
export const reorderLocalPlaylistSermons = action(
  async (ctx, playlistId: string, sermonIds: string[]) => {
    const playlists = ctx.get(myPlaylistsAtom)
    const target = playlists.find(playlist => playlist.id === playlistId)
    if (!target || target.id === FAVORITES_PLAYLIST.id) return playlists

    const nextTarget: LocalPlaylistData = (() => {
      if (target.sermons.length === 0) {
        const orderedIds = permuteById(
          target.sermonIds.map(id => ({ id })),
          sermonIds,
        ).map(item => item.id)
        return { ...target, sermonIds: orderedIds }
      }

      const sermons = permuteById(target.sermons, sermonIds)
      return { ...target, sermonIds: sermons.map(sermon => sermon.id), sermons }
    })()

    const nextPlaylists = withFavoritesFirst(
      playlists.map(playlist => (playlist.id === playlistId ? nextTarget : playlist)),
    )

    await ctx.schedule(() => {
      myPlaylistsAtom(ctx, nextPlaylists)
    })
    try {
      await persistMyPlaylists(nextPlaylists)
    } catch (error) {
      console.error('[reorderLocalPlaylistSermons] failed to persist order:', error)
    }
    return nextPlaylists
  },
  'reorderLocalPlaylistSermons',
)
