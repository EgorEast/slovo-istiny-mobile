import { action, atom } from '@reatom/framework'
import { type OnboardingScenarioId, scenariosById } from './lib/scenarios'

export interface OnboardingTargetRect {
  height: number
  width: number
  x: number
  y: number
}

export type OnboardingTourState = null | OnboardingTourStateValue

interface OnboardingTourStateValue {
  scenarioId: OnboardingScenarioId
  // Steps dropped from the deck for the rest of the tour (see `skipOnboardingStep`).
  skippedIndexes: number[]
  stepIndex: number
}

type SkipDirection = 'back' | 'next'

export const onboardingTourAtom = atom<OnboardingTourState>(null, 'onboardingTourAtom')

export const onboardingTargetRectsAtom = atom<Record<string, OnboardingTargetRect>>(
  {},
  'onboardingTargetRectsAtom',
)

// The nearest step that is still in the deck, walking `direction` from `fromIndex`.
// `undefined` means every step that way has been skipped — the deck boundary.
const findNearestVisibleIndex = (
  stepsCount: number,
  skippedIndexes: number[],
  fromIndex: number,
  direction: -1 | 1,
): number | undefined => {
  for (let index = fromIndex + direction; index >= 0 && index < stepsCount; index += direction)
    if (!skippedIndexes.includes(index)) return index

  return undefined
}

export const startOnboardingTour = action((ctx, scenarioId: OnboardingScenarioId) => {
  onboardingTargetRectsAtom(ctx, {})
  onboardingTourAtom(ctx, { scenarioId, skippedIndexes: [], stepIndex: 0 })
}, 'startOnboardingTour')

export const goToNextOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const steps = scenariosById[tour.scenarioId].steps
  const nextIndex = findNearestVisibleIndex(steps.length, tour.skippedIndexes, tour.stepIndex, 1)
  if (nextIndex === undefined) return

  onboardingTourAtom(ctx, { ...tour, stepIndex: nextIndex })
}, 'goToNextOnboardingStep')

export const goToPrevOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const steps = scenariosById[tour.scenarioId].steps
  const prevIndex = findNearestVisibleIndex(steps.length, tour.skippedIndexes, tour.stepIndex, -1)
  if (prevIndex === undefined) return

  onboardingTourAtom(ctx, { ...tour, stepIndex: prevIndex })
}, 'goToPrevOnboardingStep')

// Drops the current step from the deck and lands on the nearest surviving neighbor
// in `direction`. When nothing survives that way the current step is already the
// first/last visible one, so the tour stays put — a skip never ends the tour.
export const skipOnboardingStep = action((ctx, direction: SkipDirection) => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const steps = scenariosById[tour.scenarioId].steps
  const markedIndexes = tour.skippedIndexes.includes(tour.stepIndex)
    ? tour.skippedIndexes
    : [...tour.skippedIndexes, tour.stepIndex]
  const neighbor = findNearestVisibleIndex(
    steps.length,
    markedIndexes,
    tour.stepIndex,
    direction === 'next' ? 1 : -1,
  )
  if (neighbor === undefined) return

  onboardingTourAtom(ctx, { ...tour, skippedIndexes: markedIndexes, stepIndex: neighbor })
}, 'skipOnboardingStep')

export const endOnboardingTour = action(ctx => {
  onboardingTourAtom(ctx, null)
  onboardingTargetRectsAtom(ctx, {})
}, 'endOnboardingTour')

const isSameRect = (a: OnboardingTargetRect, b: OnboardingTargetRect) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

export const registerOnboardingTargetRect = action(
  (ctx, payload: { id: string; rect: OnboardingTargetRect }) => {
    const rects = ctx.get(onboardingTargetRectsAtom)
    const existing = rects[payload.id]
    // Repeated measurements of a settled target are the common case (the bounded
    // re-measure schedule), so skip the write when the rect is unchanged.
    if (existing !== undefined && isSameRect(existing, payload.rect)) return

    onboardingTargetRectsAtom(ctx, { ...rects, [payload.id]: payload.rect })
  },
  'registerOnboardingTargetRect',
)
