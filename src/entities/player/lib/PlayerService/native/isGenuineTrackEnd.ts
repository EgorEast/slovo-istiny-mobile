const STALE_TRACK_END_TOLERANCE_MS = 3000

interface FinishStatus {
  currentTime: number
  duration: number
}

/**
 * A stale `didJustFinish` from the previous source (expo-audio #34301) carries
 * the old position, far from the new duration. Unknown duration cannot be
 * judged and is treated as a genuine end.
 * @param status - Playback status delivered by expo-audio (player or playlist).
 */
export const isGenuineTrackEnd = (status: FinishStatus): boolean => {
  if (status.duration <= 0) return true

  const remainingMs = Math.floor(status.duration * 1000) - Math.floor(status.currentTime * 1000)

  return remainingMs <= STALE_TRACK_END_TOLERANCE_MS
}
