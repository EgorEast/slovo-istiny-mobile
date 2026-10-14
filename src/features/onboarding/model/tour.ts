import { action, atom } from '@reatom/framework'
import { type OnboardingScenarioId, type OnboardingStep, scenariosById } from '../lib/scenarios'
import { onboardingTargetRectsAtom } from './targets'

export type OnboardingTourState = null | OnboardingTourStateValue

interface OnboardingTourStateValue {
  scenarioId: OnboardingScenarioId
  // Steps dropped from the deck for the rest of the tour (see `skipOnboardingStep`).
  skippedIndexes: number[]
  stepIndex: number
}

type SkipDirection = 'back' | 'next'

// Direction of the last step change. Action steps are demonstrative and forward-only:
// the tap flow consults this to perform on forward entry and render statically on back.
export const onboardingStepDirectionAtom = atom<'backward' | 'forward'>(
  'forward',
  'onboardingStepDirectionAtom',
)

export const onboardingTourAtom = atom<OnboardingTourState>(null, 'onboardingTourAtom')

// The nearest step that is still in the deck, walking `direction` from `fromIndex`.
// Walking back skips action steps too — «Назад» never lands on a demonstration that
// would otherwise replay its blink and action. `undefined` means every step that way
// has been skipped — the deck boundary.
const findNearestVisibleIndex = (
  steps: OnboardingStep[],
  skippedIndexes: number[],
  fromIndex: number,
  direction: -1 | 1,
): number | undefined => {
  for (let index = fromIndex + direction; index >= 0 && index < steps.length; index += direction) {
    if (skippedIndexes.includes(index)) continue
    if (direction === -1 && steps[index].tapActionId !== undefined) continue

    return index
  }

  return undefined
}

export const startOnboardingTour = action((ctx, scenarioId: OnboardingScenarioId) => {
  onboardingTargetRectsAtom(ctx, {})
  onboardingStepDirectionAtom(ctx, 'forward')
  onboardingTourAtom(ctx, { scenarioId, skippedIndexes: [], stepIndex: 0 })
}, 'startOnboardingTour')

export const goToNextOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const steps = scenariosById[tour.scenarioId].steps
  const nextIndex = findNearestVisibleIndex(steps, tour.skippedIndexes, tour.stepIndex, 1)
  if (nextIndex === undefined) return

  onboardingStepDirectionAtom(ctx, 'forward')
  onboardingTourAtom(ctx, { ...tour, stepIndex: nextIndex })
}, 'goToNextOnboardingStep')

export const goToPrevOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const steps = scenariosById[tour.scenarioId].steps
  const prevIndex = findNearestVisibleIndex(steps, tour.skippedIndexes, tour.stepIndex, -1)
  if (prevIndex === undefined) return

  onboardingStepDirectionAtom(ctx, 'backward')
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
    steps,
    markedIndexes,
    tour.stepIndex,
    direction === 'next' ? 1 : -1,
  )
  if (neighbor === undefined) return

  onboardingStepDirectionAtom(ctx, direction === 'next' ? 'forward' : 'backward')
  onboardingTourAtom(ctx, { ...tour, skippedIndexes: markedIndexes, stepIndex: neighbor })
}, 'skipOnboardingStep')

export const endOnboardingTour = action(ctx => {
  onboardingTourAtom(ctx, null)
  onboardingTargetRectsAtom(ctx, {})
}, 'endOnboardingTour')
