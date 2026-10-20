import { type RepeatMode } from '../model'
import { playerService } from './PlayerService'

/**
 * Applies a runtime repeat-mode change to the native queue loop. The web
 * player service has no native queue (its own auto-advance is unaffected), so
 * the method is optional there.
 * @param mode - New app repeat mode.
 */
export const applyRepeatMode = (mode: RepeatMode): void => {
  playerService.setRepeatMode?.(mode)
}
