import { type AudioPlaylist } from 'expo-audio'

const LOAD_TIMEOUT_MS = 30000

/**
 * Event-driven wait for a native playlist to report a loaded current track.
 * Works with a frozen JS timer queue: native status events are still delivered.
 * A superseded build (a newer playlist instance owns the engine) resolves false
 * without touching global state.
 * @param playlist - Playlist instance whose load is awaited.
 * @param isCurrent - Identity guard against a superseded build.
 * @param timeoutMs - Foreground safety-net timeout.
 */
export const awaitPlaylistLoaded = (
  playlist: AudioPlaylist,
  isCurrent: () => boolean,
  timeoutMs = LOAD_TIMEOUT_MS,
): Promise<boolean> => {
  if (playlist.isLoaded) return Promise.resolve(isCurrent())

  return new Promise<boolean>(resolve => {
    let settled = false

    const finish = (loaded: boolean): void => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      subscription.remove()
      resolve(loaded && isCurrent())
    }

    const subscription = playlist.addListener('playlistStatusUpdate', status => {
      if (status.isLoaded) finish(true)
    })
    const timeout = setTimeout(() => finish(false), timeoutMs)
  })
}
