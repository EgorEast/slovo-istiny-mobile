import { type PlaylistData } from 'entities/playlist/@x/listening-history'
import { type AudioPlayerData } from 'entities/sermon/@x/listening-history'
import { type ListeningHistoryEntry } from '../model/types'

export const buildSanitizedSermon = (audio: AudioPlayerData) => {
  const { playlists: _playlists, ...rest } = audio
  return rest
}

/**
 * Снапшот контекстного плейлиста записи: только сам проигрываемый трек в
 * `sermons` (с `playlists` вырезанными), чтобы запись истории не раздувалась
 * полным списком плейлиста.
 * @param playlist - Плейлист-контекст.
 * @param sanitizedSermon - Проповедь без вложенных `playlists`.
 * @returns Плейлист с единственной проповедью.
 */
export const buildContextPlaylist = (
  playlist: PlaylistData,
  sanitizedSermon: ReturnType<typeof buildSanitizedSermon>,
): PlaylistData => ({
  artwork: playlist.artwork,
  description: playlist.description,
  id: playlist.id,
  sermons: [sanitizedSermon],
  title: playlist.title,
})

export const buildHistoryEntry = (
  audio: AudioPlayerData,
  playlist: PlaylistData,
  now: number,
): ListeningHistoryEntry => {
  const sanitizedSermon = buildSanitizedSermon(audio)

  return {
    durationMs: 0,
    lastPlayedAt: now,
    playlist: buildContextPlaylist(playlist, sanitizedSermon),
    positionMs: 0,
  }
}
