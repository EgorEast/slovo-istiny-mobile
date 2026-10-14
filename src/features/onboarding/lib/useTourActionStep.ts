import { useAction } from '@reatom/npm-react'
import { useEffect } from 'react'
import { endOnboardingTour, goToNextOnboardingStep } from '../model/tour'
import { type OnboardingStep } from './scenarios'
import { getTourAction } from './tourActions'

// After an action step performs its registered action, the tour waits this long for
// the live UI to settle (menu opening, overlay appearing) before advancing on its own.
const ACTION_ADVANCE_DELAY_MS = 1000

interface TourActionStepInput {
  blinkedStepKey: null | string
  holdExpiredStepKey: null | string
  isActionStep: boolean
  isBackwardActionEntry: boolean
  isHoldingForTapRect: boolean
  isLastVisible: boolean
  isTapPhase: boolean
  step: OnboardingStep | undefined
  stepKey: string
}

// A demonstrative action step performs its registered action once the blink is done
// (or its tap target never registered, or the step declares no tap target), then
// advances on its own — or, when it is the last visible step, ends the tour, mirroring
// the «Готово» button. A missing action is not an error: the tour still advances.
// Entered backward the step is static: no action is performed and no auto-advance,
// so «Назад» can never replay the demonstration. `isPerformingAction` tells the overlay
// to hide while the step holds for its rect or performs the action (the live UI is the
// show); the pending advance clears when the step changes or the tour ends.
export const useTourActionStep = ({
  blinkedStepKey,
  holdExpiredStepKey,
  isActionStep,
  isBackwardActionEntry,
  isHoldingForTapRect,
  isLastVisible,
  isTapPhase,
  step,
  stepKey,
}: TourActionStepInput) => {
  const next = useAction(goToNextOnboardingStep)
  const end = useAction(endOnboardingTour)
  const advance = isLastVisible ? end : next
  const isBlinkDone = (step?.tapTargetId === undefined || blinkedStepKey === stepKey) && !isTapPhase
  const isPerformingAction =
    isActionStep &&
    !isBackwardActionEntry &&
    (isHoldingForTapRect || holdExpiredStepKey === stepKey || isBlinkDone)

  useEffect(() => {
    if (!isActionStep) return
    if (isBackwardActionEntry) return
    if (isTapPhase) return
    const hasTapTarget = step?.tapTargetId !== undefined
    if (hasTapTarget && blinkedStepKey !== stepKey && holdExpiredStepKey !== stepKey) return

    const action = step?.tapActionId === undefined ? undefined : getTourAction(step.tapActionId)
    action?.()

    const timer = setTimeout(advance, ACTION_ADVANCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [
    advance,
    blinkedStepKey,
    holdExpiredStepKey,
    isActionStep,
    isBackwardActionEntry,
    isTapPhase,
    step,
    stepKey,
  ])

  return { isPerformingAction }
}
