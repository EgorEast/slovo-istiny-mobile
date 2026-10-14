import { useAtom } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { onboardingStepDirectionAtom, onboardingTargetRectsAtom } from '../model'
import { resolveStepRoute } from './resolveStepRoute'
import { type OnboardingScenario, type OnboardingStep } from './scenarios'
import { useSkipMissingStep } from './useSkipMissingStep'
import { useStepEnterAction } from './useStepEnterAction'
import { useTourActionStep } from './useTourActionStep'
import { useTourTapFlow } from './useTourTapFlow'
import { useWaitForSatisfied } from './useWaitForSatisfied'

interface StepNavigationInput {
  bottomInset: number
  isTourActive: boolean
  scenario: OnboardingScenario | undefined
  step: OnboardingStep | undefined
  stepIndex: number | undefined
  stepKey: string
  viewportHeight: number
}

// Resolves the active step's effective route, holds navigation while a tap hint blinks
// on the element the tour "presses", then navigates — or, for a demonstrative action
// step, performs the registered action and advances on its own. A `skipIfMissing`
// step whose target never registers is dropped by useSkipMissingStep.
export const useStepNavigation = ({
  bottomInset,
  isTourActive,
  scenario,
  step,
  stepIndex,
  stepKey,
  viewportHeight,
}: StepNavigationInput) => {
  const router = useRouter()
  const pathname = usePathname()
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const [stepDirection] = useAtom(onboardingStepDirectionAtom)

  const effectiveRoute =
    scenario === undefined || stepIndex === undefined
      ? undefined
      : resolveStepRoute(scenario, stepIndex)
  const needsNavigation = effectiveRoute !== undefined && pathname !== effectiveRoute
  const isActionStep = step?.tapActionId !== undefined
  // An action step is demonstrative: it never navigates, so the tap flow (blink on
  // the target, then perform the action and advance) is driven by the action itself.
  // Entered backward it is shown statically: no blink, no action, no auto-advance.
  const isBackwardActionEntry = isActionStep && stepDirection === 'backward'
  const isTapFlow = isActionStep || needsNavigation
  const tapRect = step?.tapTargetId === undefined ? undefined : rects[step.tapTargetId]
  const {
    blinkedStepKey,
    holdExpiredStepKey,
    holdNavigation,
    isHoldingForTapRect,
    isTapPending,
    isTapPhase,
  } = useTourTapFlow({
    bottomInset,
    isBackwardActionEntry,
    isRouteReached: effectiveRoute !== undefined && !needsNavigation,
    isTapFlow,
    isTourActive,
    step,
    stepKey,
    tapRect,
    viewportHeight,
  })
  const { isPerformingAction } = useTourActionStep({
    blinkedStepKey,
    holdExpiredStepKey,
    isActionStep,
    isBackwardActionEntry,
    isHoldingForTapRect,
    isTapPhase,
    step,
    stepKey,
  })

  useStepEnterAction({
    actionOnEnterId: step?.actionOnEnterId,
    isTourActive,
    stepKey,
  })

  const skipTargetId = step?.targetId
  const isSkippingStep = useSkipMissingStep({
    stepIndex,
    waitingForTarget:
      isTourActive &&
      step?.skipIfMissing === true &&
      skipTargetId !== undefined &&
      !needsNavigation &&
      rects[skipTargetId] === undefined,
  })

  useEffect(() => {
    if (holdNavigation) return
    if (effectiveRoute === undefined) return

    if (pathname !== effectiveRoute) router.navigate(effectiveRoute)
  }, [effectiveRoute, holdNavigation, pathname, router])

  // The overlay hides while the router moves to the route, while an action step
  // performs its action, and while a `skipIfMissing` step waits to see whether its
  // target registers at all.
  const isNavigatingToStep = needsNavigation && !isTapPending
  const isOverlayHidden = isNavigatingToStep || isPerformingAction || isSkippingStep
  const isWaitSatisfied = useWaitForSatisfied(step?.waitFor)

  return { holdNavigation, isOverlayHidden, isWaitSatisfied, tapRect }
}
