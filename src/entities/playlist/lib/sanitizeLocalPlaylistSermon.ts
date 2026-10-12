import { type SermonShape } from 'shared/model'

/**
 * Приводит проповедь к самодостаточному снапшоту для хранения внутри
 * локального плейлиста.
 *
 * Снапшот должен проходить `localSermonSchema` при чтении из AsyncStorage:
 *  - `playlists` — не отбрасываются, а проецируются в лёгкие рефы
 *    `{ artwork, id, title, sermons: [] }`: сервер шлёт членства проповеди на
 *    всех эндпоинтах, и снапшоту они нужны, чтобы UI видел, в каких серверных
 *    плейлистах проповедь есть (например, выбор «Где продолжить» после удаления
 *    играющей проповеди со страницы плейлиста). Очередь проповедей и вложенные
 *    структуры не хранятся в снапшоте — размер не растёт;
 *  - `artwork` — сервер может прислать `null`; ключ обязан присутствовать
 *    (`artwork: z.string().nullable()`), иначе выпадет из JSON и уронит парс.
 * @param sermon - Полная проповедь из каталога.
 * @returns Санитизированный снапшот для персистенции.
 */
export const toPersistedLocalSermon = (sermon: SermonShape): SermonShape => {
  const { playlists, ...rest } = sermon
  return {
    ...rest,
    artwork: sermon.artwork ?? null,
    ...(playlists
      ? {
          playlists: playlists.map(playlist => ({
            artwork: playlist.artwork ?? null,
            id: playlist.id,
            sermons: [],
            title: playlist.title,
          })),
        }
      : {}),
  }
}
