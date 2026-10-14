import { type OnboardingTargetRect } from '../model/targets'
import { type OnboardingStep } from './scenarios'
import { useTourActionStep } from './useTourActionStep'
import { useTourTapFlow } from './useTourTapFlow'

// Runs the tap hint (blink on the live control) and, for an exit visualization, its
// registered action. A route card blinks, then useRouteNavigation moves the router;
// an exit visualization performs its action and advances the exit/deck.
export const useTourVisuals = ({
  activeStep,
  activeStepKey,
  bottomInset,
  isActionStep,
  isBlinkAllowed,
  isFinalExit,
  isRouteReached,
  isTapFlow,
  isTourActive,
  tapRect,
  viewportHeight,
}: {
  activeStep: OnboardingStep | undefined
  activeStepKey: string
  bottomInset: number
  isActionStep: boolean
  isBlinkAllowed: boolean
  isFinalExit: boolean
  isRouteReached: boolean
  isTapFlow: boolean
  isTourActive: boolean
  tapRect: OnboardingTargetRect | undefined
  viewportHeight: number
}) => {
  const {
    blinkedStepKey,
    holdExpiredStepKey,
    holdNavigation,
    isHoldingForTapRect,
    isTapPending,
    isTapPhase,
  } = useTourTapFlow({
    bottomInset,
    isBlinkAllowed,
    isRouteReached,
    isTapFlow,
    isTourActive,
    step: activeStep,
    stepKey: activeStepKey,
    tapRect,
    viewportHeight,
  })
  const { isPerformingAction } = useTourActionStep({
    blinkedStepKey,
    holdExpiredStepKey,
    isActionStep,
    isFinalExit,
    isHoldingForTapRect,
    isTapPhase,
    step: activeStep,
    stepKey: activeStepKey,
  })

  return { holdNavigation, isPerformingAction, isTapPending }
}
