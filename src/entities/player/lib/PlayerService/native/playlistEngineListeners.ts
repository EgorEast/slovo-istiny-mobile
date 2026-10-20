import { type AudioPlaylist, type AudioPlaylistStatus } from 'expo-audio'
import { type PlaylistEngineCallbacks, type TrackSnapshot } from './playlistEngineTypes'

export interface PlaylistSubscriptions {
  status: { remove: () => void } | null
  track: { remove: () => void } | null
}

/**
 * Attaches the two native playlist event streams. Status events feed the
 * per-index snapshot map (old-track flush on switch) and the atom sync layer;
 * trackChanged flips the engine's current-source tracking before notifying JS.
 * @param playlist - Playlist instance to observe.
 * @param callbacks - Delegated event consumers.
 * @param snapshots - Per-index snapshot map updated on every status event.
 * @param onSourceChange - Receives the incoming track's resolved source URI.
 * @param sources - Resolved source URIs in queue order.
 */
export const attachPlaylistListeners = (
  playlist: AudioPlaylist,
  callbacks: PlaylistEngineCallbacks,
  snapshots: Map<number, TrackSnapshot>,
  onSourceChange: (source: null | string) => void,
  sources: string[],
): PlaylistSubscriptions => ({
  status: playlist.addListener('playlistStatusUpdate', (status: AudioPlaylistStatus) => {
    snapshots.set(status.currentIndex, {
      currentTime: status.currentTime,
      duration: status.duration,
    })
    callbacks.onStatus(status)
  }),
  track: playlist.addListener('trackChanged', ({ currentIndex, previousIndex }) => {
    onSourceChange(sources[currentIndex] ?? null)
    callbacks.onTrackChanged(previousIndex, currentIndex)
  }),
})
