import { type AudioPlaylist } from 'expo-audio'
import { type PlaylistEngineStatus } from './playlistEngineTypes'

const IDLE_STATUS: PlaylistEngineStatus = {
  durationMs: 0,
  isBuffering: false,
  isLoaded: false,
  isPlaying: false,
  playbackRate: 1,
  positionMs: 0,
  volume: 1,
}

/**
 * Projects the native playlist instance into the domain status shape used by
 * PlayerService.getStatus (milliseconds, isPlaying).
 * @param playlist - Native playlist instance (null before the first build).
 */
export const readPlaylistStatus = (playlist: AudioPlaylist | null): PlaylistEngineStatus => {
  if (!playlist?.isLoaded) return IDLE_STATUS

  return {
    durationMs: Math.floor(playlist.duration * 1000),
    isBuffering: playlist.isBuffering,
    isLoaded: playlist.isLoaded,
    isPlaying: playlist.playing,
    playbackRate: playlist.playbackRate,
    positionMs: Math.floor(playlist.currentTime * 1000),
    volume: playlist.volume,
  }
}
