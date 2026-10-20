import { type AudioPlayer, type AudioPlaylist } from 'expo-audio'

/**
 * Playback surface shared by the single-track player and the native playlist
 * queue. Both extend expo-audio's native base and expose the same playback,
 * preference and lock-screen methods used by the player service.
 */
export type PlayableAudio = AudioPlayer | AudioPlaylist

/**
 * Applies a playback rate to either native surface. AudioPlayer exposes a
 * setter with pitch-correction quality; AudioPlaylist only has the property.
 * @param player - Playlist or single-track player.
 * @param rate - Target playback rate.
 */
export const setPlayablePlaybackRate = (player: PlayableAudio, rate: number): void => {
  if ('setPlaybackRate' in player) player.setPlaybackRate(rate, 'high')
  else player.playbackRate = rate
}
