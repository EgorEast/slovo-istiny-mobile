import { type PlaylistData } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'

/**
 * Режим открытой модалки «Добавить в плейлист»:
 * - `sermon` — одна проповедь (контекст-меню строки трека);
 * - `all` — все проповеди исходного плейлиста («Добавить все проповеди» в меню
 *   шапки), где `playlist.sermons` — снапшоты для добавления.
 */
export type AddToPlaylistState =
  { kind: 'all'; playlist: PlaylistData } | { kind: 'sermon'; sermon: SermonData }
