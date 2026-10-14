import { type OnboardingStep } from './scenarios'

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
