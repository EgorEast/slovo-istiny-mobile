import { type AudioPlaylist, type AudioPlaylistLoopMode } from 'expo-audio'
import { reportError } from 'shared/model/error-dialog'

const CONTROL_ERROR_MESSAGE = 'Ошибка при управлении очередью воспроизведения'

const reportControlError = (error: unknown): void => {
  console.error('[PlaylistEngine] control call failed:', error)
  reportError(error, CONTROL_ERROR_MESSAGE)
}

/**
 * Runs a synchronous native playlist control, containing native failures.
 * @param playlist - Playlist instance (null is a no-op).
 * @param control - Synchronous call to perform.
 */
export const withPlaylist = (
  playlist: AudioPlaylist | null,
  control: (playlist: AudioPlaylist) => void,
): void => {
  if (!playlist) return
  try {
    control(playlist)
  } catch (error) {
    reportControlError(error)
  }
}

export const setPlaylistLoop = (
  playlist: AudioPlaylist | null,
  loop: AudioPlaylistLoopMode,
): void => withPlaylist(playlist, instance => (instance.loop = loop))

export const skipPlaylistTo = (playlist: AudioPlaylist | null, index: number): void =>
  withPlaylist(playlist, instance => instance.skipTo(index))

export const seekPlaylist = (playlist: AudioPlaylist | null, seconds: number): Promise<void> => {
  if (!playlist) return Promise.resolve()
  return playlist.seekTo(seconds).catch((error: unknown) => {
    console.error('[PlaylistEngine] seekTo failed:', error)
    reportError(error, 'Ошибка при перемотке аудио')
  })
}

export const destroyPlaylistNative = (playlist: AudioPlaylist | null): void =>
  withPlaylist(playlist, instance => instance.destroy())
