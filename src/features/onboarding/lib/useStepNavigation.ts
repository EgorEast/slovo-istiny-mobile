import { useAtom } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { onboardingTargetRectsAtom } from '../model'
import { type OnboardingScenario, type OnboardingStep, resolveStepRoute } from './scenarios'
import { isRectOutsideViewport } from './tourScrollable'
import { useWaitForSatisfied } from './useWaitForSatisfied'

// A tap hint blinks three times (~800ms each) before the tour navigates.
const TAP_PHASE_MS = 2400
// Starting a tour wipes the rect registry, so the first navigation can fire before
// the tap target's rect is measured. Navigation is held this long for the rect to
// register: if it does, the blink plays; otherwise the tour moves on without it.
const HOLD_FOR_TAP_MS = 500

interface StepNavigationInput {
  bottomInset: number
  isTourActive: boolean
  scenario: OnboardingScenario | undefined
  step: OnboardingStep | undefined
  stepIndex: number | undefined
  stepKey: string
  viewportHeight: number
}

// Resolves the active step's effective route, holds navigation while a tap hint
// blinks on the element the tour "presses", then navigates.
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
  const [phaseStepKey, setPhaseStepKey] = useState<null | string>(null)
  const [blinkedStepKey, setBlinkedStepKey] = useState<null | string>(null)
  const [holdExpiredStepKey, setHoldExpiredStepKey] = useState<null | string>(null)
  const blinkedStepRef = useRef<null | string>(null)

  const effectiveRoute =
    scenario === undefined || stepIndex === undefined
      ? undefined
      : resolveStepRoute(scenario, stepIndex)
  const needsNavigation = effectiveRoute !== undefined && pathname !== effectiveRoute
  const tapRect = step?.tapTargetId === undefined ? undefined : rects[step.tapTargetId]
  const shouldBlink =
    isTourActive &&
    needsNavigation &&
    tapRect !== undefined &&
    !isRectOutsideViewport(tapRect, viewportHeight, bottomInset)
  const isTapPhase = phaseStepKey === stepKey
  const isBlinkPending = shouldBlink && blinkedStepKey !== stepKey
  const isAwaitingTapRect =
    isTourActive && needsNavigation && step?.tapTargetId !== undefined && tapRect === undefined
  const isHoldingForTapRect = isAwaitingTapRect && holdExpiredStepKey !== stepKey
  const holdNavigation = isTapPhase || isBlinkPending || isHoldingForTapRect

  useEffect(() => {
    if (!shouldBlink) return
    if (blinkedStepRef.current === stepKey) return

    blinkedStepRef.current = stepKey
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- mark the step as blinked
    setBlinkedStepKey(stepKey)
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- start the blink phase on step activation
    setPhaseStepKey(stepKey)
    const timer = setTimeout(() => setPhaseStepKey(null), TAP_PHASE_MS)
    return () => clearTimeout(timer)
  }, [shouldBlink, stepKey])

  // Wait briefly for a declared tap target's rect before navigating without a hint.
  useEffect(() => {
    if (!isHoldingForTapRect) return

    const timer = setTimeout(() => setHoldExpiredStepKey(stepKey), HOLD_FOR_TAP_MS)
    return () => clearTimeout(timer)
  }, [isHoldingForTapRect, stepKey])

  // Self-navigation race: the user can tap the real control during the blink and
  // arrive at the route themselves. Then the hint is stale — cancel the phase
  // (the timer is cleared by the blink effect's cleanup) and let the step render.
  useEffect(() => {
    if (!isTapPhase || needsNavigation) return

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect -- pathname reached the effective route
    setPhaseStepKey(null)
  }, [isTapPhase, needsNavigation])

  useEffect(() => {
    if (holdNavigation) return
    if (effectiveRoute === undefined) return

    if (pathname !== effectiveRoute) router.navigate(effectiveRoute)
  }, [effectiveRoute, holdNavigation, pathname, router])

  useEffect(() => {
    if (isTourActive) return

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect -- reset tap phase when the tour ends
    setPhaseStepKey(null)
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- reset blink guard when the tour ends
    setBlinkedStepKey(null)
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- reset the tap-rect hold when the tour ends
    setHoldExpiredStepKey(null)
    blinkedStepRef.current = null
  }, [isTourActive])

  // The overlay hides while the router moves to the route, except during the tap
  // phase (the pass-through hint replaces it) and while the blink is about to start.
  const isNavigatingToStep =
    effectiveRoute !== undefined && pathname !== effectiveRoute && !isTapPhase && !isBlinkPending
  const isWaitSatisfied = useWaitForSatisfied(step?.waitFor)

  return { holdNavigation, isNavigatingToStep, isWaitSatisfied, tapRect }
}
