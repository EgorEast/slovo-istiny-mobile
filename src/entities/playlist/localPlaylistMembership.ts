import { action } from '@reatom/framework'
import { type SermonShape } from 'shared/model'
import { toPersistedLocalSermon } from './lib/sanitizeLocalPlaylistSermon'
import { type LocalPlaylistData, MAX_CUSTOM_PLAYLIST_SERMONS } from './localPlaylists'
import { persistMyPlaylists } from './localPlaylistStorage'
import { myPlaylistsAtom } from './model'

/** Итог переключения принадлежности проповеди локальному плейлисту. */
type TogglePlaylistSermonOutcome = 'added' | 'limit-reached' | 'noop' | 'removed'

const withSermons = (playlist: LocalPlaylistData, sermons: SermonShape[]): LocalPlaylistData => ({
  ...playlist,
  sermonIds: sermons.map(item => item.id),
  sermons,
})

const addSermonSnapshot = (playlist: LocalPlaylistData, sermon: SermonShape) =>
  withSermons(playlist, [...playlist.sermons, toPersistedLocalSermon(sermon)])

const removeSermonSnapshot = (playlist: LocalPlaylistData, sermonId: string) =>
  withSermons(
    playlist,
    playlist.sermons.filter(item => item.id !== sermonId),
  )

/**
 * Переключение принадлежности проповеди локальному плейлисту.
 *
 * Обновляет `myPlaylistsAtom` (добавляет/удаляет снапшот проповеди в `sermons`
 * плейлиста, «Избранные» включены) и персистит результат тем же путём, что и
 * reorder. Снапшот проходит санитизацию (`toPersistedLocalSermon`), чтобы
 * гарантированно проходить `sermonDataSchema` при чтении и быть рендерящимся
 * и проигрываемым офлайн. `sermonIds` остаются производными от `sermons`.
 * Чтение атома → вычисление `nextPlaylists` → коммит идут без `await` между
 * ними, поэтому конкурентные переключения не теряют изменения друг друга
 * (lost update). Неизвестный id плейлиста — no-op. Удаление отсутствующей
 * проповеди — no-op (идемпотентность). Добавление сверх
 * `MAX_CUSTOM_PLAYLIST_SERMONS` — no-op с исходом `limit-reached` (атом и
 * хранилище не трогаются), чтобы плейлист не разросся за бюджет ссылки.
 * Запись в хранилище может отклониться (сломанный нативный модуль, квота, …);
 * такой отказ логируется, но атом уже закоммичен — та же политика деградации,
 * что и у `reorderMyPlaylists`.
 * @param playlistId - Идентификатор плейлиста, которому меняем принадлежность.
 * @param sermon - Полная проповедь (для добавления сохраняется её снапшот).
 * @param contained - `true` — добавить, `false` — удалить.
 * @returns Исход операции: `added`/`removed` при изменении, `noop` — нечего
 * менять, `limit-reached` — добавление отклонено из-за лимита.
 */
export const togglePlaylistSermon = action(
  async (
    ctx,
    playlistId: string,
    sermon: SermonShape,
    contained: boolean,
  ): Promise<TogglePlaylistSermonOutcome> => {
    const playlists = ctx.get(myPlaylistsAtom)
    const target = playlists.find(playlist => playlist.id === playlistId)
    if (!target) return 'noop'

    const alreadyContained = target.sermonIds.includes(sermon.id)
    if (contained === alreadyContained) return 'noop'

    if (contained && target.sermonIds.length >= MAX_CUSTOM_PLAYLIST_SERMONS) return 'limit-reached'

    const nextPlaylists = playlists.map(playlist => {
      if (playlist.id !== playlistId) return playlist
      return contained
        ? addSermonSnapshot(playlist, sermon)
        : removeSermonSnapshot(playlist, sermon.id)
    })

    await ctx.schedule(() => {
      myPlaylistsAtom(ctx, nextPlaylists)
    })

    try {
      await persistMyPlaylists(nextPlaylists)
    } catch (error) {
      console.error('[togglePlaylistSermon] failed to persist membership:', error)
    }
    return contained ? 'added' : 'removed'
  },
  'togglePlaylistSermon',
)
