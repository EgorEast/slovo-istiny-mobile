import { useAction } from '@reatom/npm-react'
import { useEffect, useRef } from 'react'
import { endOnboardingTour, goToNextOnboardingStep, goToPrevOnboardingStep } from '../model'

// A `skipIfMissing` step whose target never registers is dropped: 600 ms is long
// enough for a mounted row to measure, short enough not to stall the tour when
// the row is genuinely absent (admin/local-only/feature-gated).
const SKIP_MISSING_MS = 600

interface SkipMissingStepInput {
  lastStepIndex: number | undefined
  stepIndex: number | undefined
  // True while a `skipIfMissing` step's target is still unregistered.
  waitingForTarget: boolean
}

// Skips a step whose target never registers, in the direction the user arrived:
// forward for «Далее», backward for «Назад» (so a step entered with «Назад» is
// skipped backwards). On the first/last step the skip ends the tour, so a cascade
// of missing targets never loops. Returns whether the step is currently being
// skipped — the overlay stays hidden meanwhile.
export const useSkipMissingStep = ({
  lastStepIndex,
  stepIndex,
  waitingForTarget,
}: SkipMissingStepInput) => {
  const nextStep = useAction(goToNextOnboardingStep)
  const prevStep = useAction(goToPrevOnboardingStep)
  const endTour = useAction(endOnboardingTour)
  const directionRef = useRef<'backward' | 'forward'>('forward')
  const previousIndexRef = useRef(stepIndex)

  useEffect(() => {
    const previous = previousIndexRef.current
    if (stepIndex === undefined || previous === undefined) return

    if (stepIndex < previous) directionRef.current = 'backward'
    else if (stepIndex > previous) directionRef.current = 'forward'
    previousIndexRef.current = stepIndex
  }, [stepIndex])

  useEffect(() => {
    if (!waitingForTarget) return

    const timer = setTimeout(() => {
      if (directionRef.current === 'backward') {
        if (stepIndex === 0) endTour()
        else prevStep()
        return
      }

      if (stepIndex === lastStepIndex) endTour()
      else nextStep()
    }, SKIP_MISSING_MS)

    return () => clearTimeout(timer)
  }, [endTour, lastStepIndex, nextStep, prevStep, stepIndex, waitingForTarget])

  return waitingForTarget
}
