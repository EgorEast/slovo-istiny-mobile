import { type LocalPlaylistData } from 'entities/playlist'

// Минимальный снапшот проповеди для предзаполнения пикера админ-формы. Для
// проповеди без снапшота (id-only плейлист из ссылки) остаётся только `id` —
// строка не отрендерится, но выбор сохранится.
interface PublishSermonEntry {
  artist?: string
  artwork?: null | string
  id: string
  title?: string
}

/**
 * Сериализует проповеди локального плейлиста в JSON-параметр для формы
 * публикации.
 *
 * `sermonIds` задают порядок и полноту набора; для каждого id берётся снапшот
 * из `sermons`, если он есть, иначе — запись только с `id`. Так `SermonPicker`
 * админ-формы может отрендерить уже выбранные строки (`mergeById`), а проповеди
 * без снапшота остаются выбранными по id.
 * @param playlist - Локальный плейлист для публикации.
 * @returns JSON-массив записей (со снапшотами или id-only).
 */
export const buildPublishSermonsParam = (playlist: LocalPlaylistData): string => {
  const snapshotsById = new Map(playlist.sermons.map(sermon => [sermon.id, sermon]))
  const entries: PublishSermonEntry[] = playlist.sermonIds.map(id => {
    const sermon = snapshotsById.get(id)
    if (!sermon) return { id }
    return { artist: sermon.artist, artwork: sermon.artwork, id, title: sermon.title }
  })
  return JSON.stringify(entries)
}
