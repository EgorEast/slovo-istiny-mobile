import { audioCacheService } from 'entities/offline-cache/@x/player'

/**
 * Resolves a queue source to an absolute URI. Only completed cache files are
 * used: partial downloads must never enter the native queue (their truncated
 * duration would corrupt the whole timeline), and background caching stays a
 * per-current-track concern armed by the switch coordinator.
 * @param audioUrl - Original network URL of the track.
 */
export const resolveQueueSource = async (audioUrl: string): Promise<string> => {
  try {
    const cachedUri = await audioCacheService.getCachedUri(audioUrl)
    return cachedUri ?? audioUrl
  } catch (error) {
    console.error('[PlaylistEngine] resolveQueueSource cache check failed:', error)
    return audioUrl
  }
}
