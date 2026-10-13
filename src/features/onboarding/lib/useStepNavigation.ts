import { useAtom } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { onboardingTargetRectsAtom } from '../model'
import { type OnboardingScenario, type OnboardingStep, resolveStepRoute } from './scenarios'
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
// step, performs the registered action and advances on its own.
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

  const effectiveRoute =
    scenario === undefined || stepIndex === undefined
      ? undefined
      : resolveStepRoute(scenario, stepIndex)
  const needsNavigation = effectiveRoute !== undefined && pathname !== effectiveRoute
  const isActionStep = step?.tapActionId !== undefined
  // An action step is demonstrative: it never navigates, so the tap flow (blink on
  // the target, then perform the action and advance) is driven by the action itself.
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
    isHoldingForTapRect,
    isTapPhase,
    step,
    stepKey,
  })

  useEffect(() => {
    if (holdNavigation) return
    if (effectiveRoute === undefined) return

    if (pathname !== effectiveRoute) router.navigate(effectiveRoute)
  }, [effectiveRoute, holdNavigation, pathname, router])

  // The overlay hides while the router moves to the route, except during the tap
  // phase (the pass-through hint replaces it) and while the blink is about to start.
  const isNavigatingToStep = needsNavigation && !isTapPending
  const isWaitSatisfied = useWaitForSatisfied(step?.waitFor)

  return { holdNavigation, isNavigatingToStep, isPerformingAction, isWaitSatisfied, tapRect }
}
