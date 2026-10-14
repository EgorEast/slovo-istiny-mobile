import { type OnboardingStep } from './scenarios'

export interface TourProgress {
  displayIndex: number
  displayTotal: number
  isFirstVisible: boolean
  isLastVisible: boolean
}

// Where the current step sits in the deck of *visible* steps: skipped steps are
// removed, so the counter shows real numbers and the last visible step closes the
// tour. `displayIndex` is 0-based over the surviving steps.
export const resolveTourProgress = (
  steps: readonly OnboardingStep[],
  skippedIndexes: number[],
  stepIndex: number,
): TourProgress => {
  const skipped = new Set(skippedIndexes.filter(index => index >= 0 && index < steps.length))
  const visibleIndexes = steps.map((_, index) => index).filter(index => !skipped.has(index))
  const displayTotal = visibleIndexes.length
  const displayIndex = visibleIndexes.indexOf(stepIndex)

  return {
    displayIndex,
    displayTotal,
    isFirstVisible: visibleIndexes[0] === stepIndex,
    isLastVisible: visibleIndexes[displayTotal - 1] === stepIndex,
  }
}

// Steps whose target may legitimately be absent. A `skipIfMissing` step whose target
// has not registered is dropped from the deck — but only once the screen hosting
// those targets has rendered at least one of them: before that (menu still closed)
// every `skipIfMissing` target merely looks absent and the deck would collapse to
// the pre-menu steps.
export const resolveHiddenStepIndexes = (
  steps: readonly OnboardingStep[],
  registeredTargetIds: readonly string[],
): number[] => {
  const registered = new Set(registeredTargetIds)
  const skipTargets = steps.flatMap((step, index) =>
    step.skipIfMissing === true && step.targetId !== undefined
      ? [{ index, targetId: step.targetId }]
      : [],
  )
  const hasRegisteredTarget = skipTargets.some(({ targetId }) => registered.has(targetId))
  if (!hasRegisteredTarget) return []

  return skipTargets.filter(({ targetId }) => !registered.has(targetId)).map(({ index }) => index)
}
