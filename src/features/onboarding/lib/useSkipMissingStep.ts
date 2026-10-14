import { useAction } from '@reatom/npm-react'
import { useEffect, useRef } from 'react'
import { skipOnboardingStep } from '../model/tour'

// A `skipIfMissing` step whose target never registers is dropped: 600 ms is long
// enough for a mounted row to measure, short enough not to stall the tour when
// the row is genuinely absent (admin/local-only/feature-gated).
const SKIP_MISSING_MS = 600

interface SkipMissingStepInput {
  // True when a target other than this step's own is registered. The step's own rect
  // is unregistered (waitingForTarget), so any registered rect proves the surface
  // already rendered its items — the missing target is genuinely absent.
  hasOtherRegisteredRect: boolean
  stepIndex: number | undefined
  // True while a `skipIfMissing` step's target is still unregistered.
  waitingForTarget: boolean
}

// Drops a step whose target never registers, in the direction the user arrived:
// forward for «Далее», backward for «Назад» (so a step entered with «Назад» is
// dropped backward). The skipped step leaves the deck for good; the tour never ends
// from a skip. Returns whether the step is currently being skipped — the overlay
// stays hidden meanwhile.
export const useSkipMissingStep = ({
  hasOtherRegisteredRect,
  stepIndex,
  waitingForTarget,
}: SkipMissingStepInput) => {
  const skipStep = useAction(skipOnboardingStep)
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

    const direction = directionRef.current === 'backward' ? 'back' : 'next'
    // The surface already rendered its items, so skip at once instead of burning the
    // hold; the 600 ms window stays for the case where nothing has registered yet
    // (the surface may still be mounting).
    if (hasOtherRegisteredRect) {
      skipStep(direction)
      return
    }

    const timer = setTimeout(() => skipStep(direction), SKIP_MISSING_MS)
    return () => clearTimeout(timer)
  }, [hasOtherRegisteredRect, skipStep, stepIndex, waitingForTarget])

  return waitingForTarget
}
