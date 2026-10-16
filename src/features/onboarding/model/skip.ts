import { action } from '@reatom/framework'
import { resolveTourDeck } from '../lib/resolveDeck'
import { findNearestDeckIndex } from '../lib/tourDeck'
import {
  onboardingEntryStepIndexAtom,
  onboardingExitStepIndexAtom,
  onboardingStepDirectionAtom,
  onboardingTourAtom,
} from './tour'

type SkipDirection = 'back' | 'next'

// Drops the current entry from the deck (its transitions with it) and lands on the
// nearest surviving neighbor in `direction`. When nothing survives that way the entry
// is already the first/last visible one, so the tour stays put — a skip never ends it.
export const skipOnboardingStep = action((ctx, direction: SkipDirection) => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const deck = resolveTourDeck(tour.scenarioId)
  const markedDeckIndexes = tour.skippedDeckIndexes.includes(tour.deckIndex)
    ? tour.skippedDeckIndexes
    : [...tour.skippedDeckIndexes, tour.deckIndex]
  const neighbor = findNearestDeckIndex(
    deck,
    markedDeckIndexes,
    tour.deckIndex,
    direction === 'next' ? 1 : -1,
  )
  if (neighbor === undefined) return

  onboardingStepDirectionAtom(ctx, direction === 'next' ? 'forward' : 'backward')
  onboardingExitStepIndexAtom(ctx, null)
  onboardingEntryStepIndexAtom(ctx, null)
  onboardingTourAtom(ctx, { ...tour, deckIndex: neighbor, skippedDeckIndexes: markedDeckIndexes })
}, 'skipOnboardingStep')
