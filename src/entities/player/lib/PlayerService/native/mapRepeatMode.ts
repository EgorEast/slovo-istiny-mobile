import { type AudioPlaylistLoopMode } from 'expo-audio'
import { RepeatMode } from '../../../model'

/**
 * Maps the app repeat mode onto the native playlist loop mode.
 * Track → repeat one media item, Queue → wrap the whole queue, Off → stop at
 * the end.
 * @param mode - Current app repeat mode.
 */
export const mapRepeatMode = (mode: RepeatMode): AudioPlaylistLoopMode => {
  if (mode === RepeatMode.Track) return 'single'
  if (mode === RepeatMode.Queue) return 'all'
  return 'none'
}
