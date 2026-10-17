import { ctx } from 'shared/lib/reatom-ctx'
import { currentAudioAtom } from '../../../model'
import { createAudioInterruptionHandler } from './nativePlayerHelpers'
import { reportPlaybackError } from './reportPlaybackError'

interface PlaybackActions {
  pause: (pauseType?: 'auto') => Promise<void>
  play: () => Promise<void>
  resumeAfterPause: (audioUrl: string) => Promise<void>
}

/**
 * Builds the service-level status callbacks once per service. Interruption
 * auto-resume goes through `resumeAfterPause` (cached-source swap), so a track
 * whose download finished while it was streamed is rebound before playing —
 * a bare `play()` silently no-ops on the dead server URI (issue #107).
 * @param actions - Player control actions the callbacks delegate to.
 */
export const createPlayerServiceCallbacks = (actions: PlaybackActions) => ({
  onAudioInterruption: createAudioInterruptionHandler({
    pause: actions.pause,
    play: () => {
      // Атом свеж к resume-ребру (setCurrentAudioAction успевает его записать до конца загрузки трека); даже устаревшее чтение replaceAudio пере-резолвит и сведётся к no-op play().
      const audioUrl = ctx.get(currentAudioAtom)?.audioUrl
      return audioUrl ? actions.resumeAfterPause(audioUrl) : actions.play()
    },
  }),
  onPlaybackError: reportPlaybackError,
})
