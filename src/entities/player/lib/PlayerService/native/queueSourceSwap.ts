import { playlistEngine } from './PlaylistEngine'

/**
 * Source-swap surface handed to resume/seek flows.
 * @param play - Service play action used after a successful swap.
 */
export const createQueueSourceSwap = (play: () => Promise<void>) => ({
  getCurrentSourceUri: playlistEngine.getCurrentSourceUri,
  play,
  swapSource: (resolvedUrl: string, positionMs: number) =>
    playlistEngine.swapCurrentSource(resolvedUrl, positionMs),
})
