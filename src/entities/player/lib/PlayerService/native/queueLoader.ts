import { type AudioPlaylist } from 'expo-audio'
import { startBackgroundCaching } from '../BackgroundCachingService'
import { audioEffectsAttach } from './audioEffectsAttach'
import { playbackController } from './PlaybackController'
import { playlistEngine } from './PlaylistEngine'
import { readQueueContext } from './queueContext'
import { findQueueIndex } from './queueSwitch'

/**
 * Builds the native queue for a load request and applies stored preferences.
 * @param audioUrl - Network URL of the requested track.
 * @param initialPositionMs - Resume position in milliseconds.
 */
export const loadQueue = async (
  audioUrl: string,
  initialPositionMs: number,
): Promise<AudioPlaylist | null> => {
  const queue = await readQueueContext(audioUrl)
  // Release the old effects chain before its native player dies with the queue.
  audioEffectsAttach.detach()
  const playlist = await playlistEngine.buildQueue(
    queue.tracks,
    queue.sources,
    queue.startIndex,
    queue.loop,
    initialPositionMs,
  )
  if (!playlist) return null

  playbackController.applyPreferences(playlist)
  // Re-assert the stored volume into the fresh native instance AND the atom:
  // the first status tick reports the instance default (1) before preferences land.
  playbackController.applyVolume(playlist, playbackController.getVolume())
  startBackgroundCaching(audioUrl)
  return playlist
}

/**
 * Switches inside the existing queue (manual next/prev, same-track restart) via
 * skipTo + seekTo; rebuilds a one-track queue when the target is not queued.
 * @param audioUrl - Network URL of the requested track.
 * @param initialPositionMs - Resume position in milliseconds.
 */
export const replaceQueueTrack = async (
  audioUrl: string,
  initialPositionMs: number,
): Promise<AudioPlaylist | null> => {
  const index = await findQueueIndex(audioUrl)
  const playlist = playlistEngine.getPlaylist()
  if (index < 0 || !playlist) return loadQueue(audioUrl, initialPositionMs)

  if (index !== playlistEngine.getCurrentIndex()) playlistEngine.skipToIndex(index)
  await playlistEngine.seekTo(Math.max(0, initialPositionMs) / 1000)
  startBackgroundCaching(audioUrl)
  return playlist
}
