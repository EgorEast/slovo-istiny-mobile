import { useAction } from '@reatom/npm-react'
import { useEffect } from 'react'
import { endOnboardingTour, goToNextOnboardingStep } from '../model/tour'
import { type OnboardingStep } from './scenarios'
import { getTourAction } from './tourActions'

// After an exit visualization performs its registered action, the tour waits this long
// for the live UI to settle (menu opening, overlay appearing) before moving on.
const ACTION_ADVANCE_DELAY_MS = 1000

interface TourActionStepInput {
  blinkedStepKey: null | string
  holdExpiredStepKey: null | string
  isActionStep: boolean
  // The last visualization of the last visible card: performing it closes the tour,
  // mirroring the «Готово» button. Every other visualization advances the exit/deck.
  isFinalExit: boolean
  isHoldingForTapRect: boolean
  isTapPhase: boolean
  step: OnboardingStep | undefined
  stepKey: string
}

// An exit visualization performs its registered action once the blink is done (or its
// tap target never registered, or it declares none), then moves on after a settle
// delay — the next visualization or the next card, or the end of the tour. A missing
// action is not an error: the tour still advances. `isPerformingAction` tells the
// overlay to hide while the visualization holds for its rect or performs the action
// (the live UI is the show); the pending advance clears when the step changes or the
// tour ends.
export const useTourActionStep = ({
  blinkedStepKey,
  holdExpiredStepKey,
  isActionStep,
  isFinalExit,
  isHoldingForTapRect,
  isTapPhase,
  step,
  stepKey,
}: TourActionStepInput) => {
  const next = useAction(goToNextOnboardingStep)
  const end = useAction(endOnboardingTour)
  const advance = isFinalExit ? end : next
  const isBlinkDone = (step?.tapTargetId === undefined || blinkedStepKey === stepKey) && !isTapPhase
  const isPerformingAction =
    isActionStep && (isHoldingForTapRect || holdExpiredStepKey === stepKey || isBlinkDone)

  useEffect(() => {
    if (!isActionStep) return
    if (isTapPhase) return
    const hasTapTarget = step?.tapTargetId !== undefined
    if (hasTapTarget && blinkedStepKey !== stepKey && holdExpiredStepKey !== stepKey) return

    const action = step?.tapActionId === undefined ? undefined : getTourAction(step.tapActionId)
    action?.()

    const timer = setTimeout(advance, ACTION_ADVANCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [advance, blinkedStepKey, holdExpiredStepKey, isActionStep, isTapPhase, step, stepKey])

  return { isPerformingAction }
}
