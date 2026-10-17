import { ctx } from 'shared/lib/reatom-ctx'
import { isStalledOfflineAtom, setIsStalledOfflineAction } from '../../stalledOffline'

interface HealableWebPlayerService {
  getState: () => { isBuffering: boolean; isPlaying: boolean; position: number }
  play: () => Promise<void>
  replaceAudio: (audioUrl: string, initialPositionMs?: number) => Promise<unknown>
}

export const recoverStreamAfterReconnect = async (
  service: HealableWebPlayerService,
  audioUrl: string,
): Promise<void> => {
  if (!audioUrl) return
  const { isBuffering, isPlaying, position } = service.getState()
  if (isPlaying && !isBuffering) return
  // A stream error while offline set the flag (Issue #109). Capture it before
  // replaceAudio — the web player has no AudioLoader chokepoint to clear it, so
  // the heal clears it right after capture.
  const stalledOffline = ctx.get(isStalledOfflineAtom)
  void setIsStalledOfflineAction(ctx, false)
  const shouldResume = isPlaying || stalledOffline
  await service.replaceAudio(audioUrl, position)
  if (shouldResume) await service.play()
}

interface ResumableWebPlayer {
  getState: () => { position: number }
  play: () => Promise<void>
  replaceAudio: (audioUrl: string, initialPositionMs?: number) => Promise<unknown>
}

/**
 * True when the live `<audio>` element is not bound to the requested track, so
 * resume must rebuild it. `endsWith` tolerates absolute-vs-relative src
 * resolution; an absent src counts as a mismatch.
 * @param currentSrc - `src` of the live element (null/undefined when absent).
 * @param audioUrl - Network URL of the track being resumed.
 */
export const shouldRebindForResume = (
  currentSrc: null | string | undefined,
  audioUrl: string,
): boolean => {
  if (!currentSrc || !audioUrl) return true
  return !currentSrc.endsWith(audioUrl) && !audioUrl.endsWith(currentSrc)
}

/**
 * Web mirror of the native cached-source swap. The Service Worker serves cached
 * bytes for the SAME URL after a rebuild, so a matching source only needs play();
 * a mismatch (stale/dead element) is reopened at the saved position.
 * @param player - Web player actions used to rebuild the element and resume.
 * @param audio - Live element, or null when nothing is loaded.
 * @param audioUrl - Network URL of the track being resumed.
 */
export const resumeWebAfterPause = async (
  player: ResumableWebPlayer,
  audio: HTMLAudioElement | null,
  audioUrl: string,
): Promise<void> => {
  if (!shouldRebindForResume(audio?.src, audioUrl)) return player.play()

  await player.replaceAudio(audioUrl, player.getState().position)
  return player.play()
}
