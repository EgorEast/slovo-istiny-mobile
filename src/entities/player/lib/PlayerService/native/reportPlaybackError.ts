import { ctx } from 'shared/lib/reatom-ctx'
import { reportError } from 'shared/model/error-dialog'
import { isOnlineAtom } from 'shared/model/network'
import { setIsStalledOfflineAction } from '../../stalledOffline'

/**
 * Surfaces an expo-audio `status.error` for diagnostics and flags an offline
 * stall so the reconnect heal can pick the stream up. Deliberately no rebind or
 * play here: recovery belongs to the next resume edge (interruption auto-resume
 * or a user tap), which goes through the cached-source swap.
 * @param message - `status.error` payload reported by expo-audio.
 */
export const reportPlaybackError = (message: string): void => {
  reportError(new Error(`[player] playback error: ${message}`))
  if (ctx.get(isOnlineAtom) === false) void setIsStalledOfflineAction(ctx, true)
}
