import { action } from '@reatom/framework'
import { resolveTourDeck } from '../lib/resolveDeck'
import { onboardingEntryStepIndexAtom, onboardingTourAtom } from './tour'

// Advances the entry transition phase: the next entry step, or the card itself when
// the last one is done. The caller skips a step outright when its screen is already
// reached, so this only ever runs after a blink/navigation or a skip.
export const advanceEntryTransition = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const entryIndex = ctx.get(onboardingEntryStepIndexAtom)
  if (entryIndex === null) return

  const entrySteps = resolveTourDeck(tour.scenarioId)[tour.deckIndex]?.entryStepIndexes ?? []
  onboardingEntryStepIndexAtom(ctx, entryIndex + 1 < entrySteps.length ? entryIndex + 1 : null)
}, 'advanceEntryTransition')
