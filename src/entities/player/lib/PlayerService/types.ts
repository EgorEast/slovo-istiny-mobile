/**
 * @file Types for PlayerService decomposition.
 * Contains shared interfaces and types used across native and web implementations.
 */

/**
 * Metadata for lock screen / system media controls.
 * Used to display track information on device lock screen and media notifications.
 */
export interface LockScreenMetadata {
  /** Album or playlist title. */
  albumTitle?: string
  /** Artist name. */
  artist?: string
  /** URL to album artwork image, or null when the track has no artwork. */
  artworkUrl?: null | string
  /** Track title (required). */
  title: string
}

/**
 * Current playback status from the audio player.
 * All values are in milliseconds except isPlaying.
 */
export interface PlaybackStatus {
  /** Total track duration in milliseconds. */
  duration: number
  /** Whether the player is currently playing. */
  isPlaying: boolean
  /** Current playback position in milliseconds. */
  position: number
}

/**
 * Player control actions used to swap the native queue source and resume.
 * `swapSource` rebinds the current queue index to an already-resolved URI
 * (cached file, retained partial or network URL) at the target position.
 */
export interface SeekSourceSwap {
  /** Resumes playback on the current (possibly swapped) playlist. */
  play: () => Promise<void>
  /** Rebinds the current queue index to a resolved source at a position in ms. */
  swapSource: (resolvedUrl: string, positionMs: number) => Promise<unknown>
}

/**
 * Callbacks for playback status changes.
 * Used to sync player state with external state management (Reatom).
 */
export interface StatusCallbacks {
  /** Called when audio is interrupted (phone call) or interruption ends. */
  onAudioInterruption: (isInterrupted: boolean) => void
}
