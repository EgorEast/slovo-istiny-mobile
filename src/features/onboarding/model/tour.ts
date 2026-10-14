import { action, atom } from '@reatom/framework'
import { resolveTourStart } from '../lib/resolveTourStart'
import { type OnboardingScenarioId, scenariosById } from '../lib/scenarios'
import { buildTourDeck, findNearestDeckIndex } from '../lib/tourDeck'
import { onboardingTargetRectsAtom } from './targets'

export type OnboardingTourState = null | OnboardingTourStateValue

interface OnboardingTourStateValue {
  // Position of the current card in the deck; visualization steps are not entries.
  deckIndex: number
  scenarioId: OnboardingScenarioId
  // Deck entries dropped for the rest of the tour (see `skipOnboardingStep`).
  skippedDeckIndexes: number[]
}

type SkipDirection = 'back' | 'next'

// Direction of the last step change. Visualizations are forward-only: the exit
// transition starts only from `goToNextOnboardingStep`, which sets this to 'forward'.
export const onboardingStepDirectionAtom = atom<'backward' | 'forward'>(
  'forward',
  'onboardingStepDirectionAtom',
)

export const onboardingTourAtom = atom<OnboardingTourState>(null, 'onboardingTourAtom')

// Position of the visualization currently playing as the current card's exit
// transition; `null` while the tour rests on a card.
export const onboardingExitStepIndexAtom = atom<null | number>(null, 'onboardingExitStepIndexAtom')

// The deck is derived from the active scenario's steps; the actions resolve it on
// demand rather than caching it, so only the position and skipped entries persist.
const resolveDeck = (scenarioId: OnboardingScenarioId) =>
  buildTourDeck(scenariosById[scenarioId].steps)

export const startOnboardingTour = action(
  (ctx, scenarioId: OnboardingScenarioId, pathname: string) => {
    onboardingTargetRectsAtom(ctx, {})
    onboardingStepDirectionAtom(ctx, 'forward')
    onboardingExitStepIndexAtom(ctx, null)

    const scenario = scenariosById[scenarioId]
    const deck = resolveDeck(scenarioId)
    const { deckIndex, skippedDeckIndexes } = resolveTourStart(scenario, deck, pathname)

    onboardingTourAtom(ctx, { deckIndex, scenarioId, skippedDeckIndexes })
  },
  'startOnboardingTour',
)

export const goToNextOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  onboardingStepDirectionAtom(ctx, 'forward')
  const deck = resolveDeck(tour.scenarioId)
  const entry = deck[tour.deckIndex]

  // Forward departure from a card plays its visualization steps in order first; each
  // call advances one exit step, and the last one falls through to the deck advance.
  if (entry !== undefined && entry.exitStepIndexes.length > 0) {
    const exitIndex = ctx.get(onboardingExitStepIndexAtom)
    if (exitIndex === null) {
      onboardingExitStepIndexAtom(ctx, 0)
      return
    }
    if (exitIndex + 1 < entry.exitStepIndexes.length) {
      onboardingExitStepIndexAtom(ctx, exitIndex + 1)
      return
    }
  }

  const nextIndex = findNearestDeckIndex(deck, tour.skippedDeckIndexes, tour.deckIndex, 1)
  onboardingExitStepIndexAtom(ctx, null)
  if (nextIndex === undefined) return

  onboardingTourAtom(ctx, { ...tour, deckIndex: nextIndex })
}, 'goToNextOnboardingStep')

// «Назад» always lands on the previous card: visualizations are not entries, so they
// are never revisited and never replay.
export const goToPrevOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const deck = resolveDeck(tour.scenarioId)
  const prevIndex = findNearestDeckIndex(deck, tour.skippedDeckIndexes, tour.deckIndex, -1)
  if (prevIndex === undefined) return

  onboardingStepDirectionAtom(ctx, 'backward')
  onboardingExitStepIndexAtom(ctx, null)
  onboardingTourAtom(ctx, { ...tour, deckIndex: prevIndex })
}, 'goToPrevOnboardingStep')

// Drops the current entry from the deck (its exit visualizations with it) and lands on
// the nearest surviving neighbor in `direction`. When nothing survives that way the
// entry is already the first/last visible one, so the tour stays put — a skip never
// ends the tour.
export const skipOnboardingStep = action((ctx, direction: SkipDirection) => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const deck = resolveDeck(tour.scenarioId)
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
  onboardingTourAtom(ctx, { ...tour, deckIndex: neighbor, skippedDeckIndexes: markedDeckIndexes })
}, 'skipOnboardingStep')

export const endOnboardingTour = action(ctx => {
  onboardingTourAtom(ctx, null)
  onboardingExitStepIndexAtom(ctx, null)
  onboardingTargetRectsAtom(ctx, {})
}, 'endOnboardingTour')
