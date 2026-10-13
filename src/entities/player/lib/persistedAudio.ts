import { type AudioPlayerData } from 'entities/sermon/@x/player'

// Приводит записываемое аудио к форме, которая гарантированно проходит
// `audioPlayerDataSchema` при восстановлении:
//  - `playlists` — не отбрасываются, а проецируются в лёгкие рефы
//    `{ artwork, id, title, sermons: [] }`: сервер шлёт членства проповеди на
//    всех эндпоинтах, и они нужны UI (например, выбор «Где продолжить» после
//    удаления играющей проповеди). Очередь проповедей и вложенные структуры не
//    хранятся — размер записи не растёт, а zod-парс не падает на тяжёлой форме;
//  - `artwork` — сервер может прислать `null` или не прислать вовсе. Ключ
//    обязан присутствовать (`artwork: z.string().nullable()`), иначе он
//    выпадет из JSON и уронит весь парс.
export const toPersistedAudio = ({ playlists, ...audio }: AudioPlayerData): AudioPlayerData => ({
  ...audio,
  artwork: audio.artwork ?? null,
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
})
