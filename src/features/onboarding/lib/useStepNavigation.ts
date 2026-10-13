import { useAtom } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { onboardingTargetRectsAtom } from '../model'
import { type OnboardingScenario, type OnboardingStep, resolveStepRoute } from './scenarios'
import { isRectOutsideViewport } from './tourScrollable'
import { useWaitForSatisfied } from './useWaitForSatisfied'

// A tap hint blinks three times (~800ms each) before the tour navigates.
const TAP_PHASE_MS = 2400

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
  const holdNavigation = isTapPhase || (shouldBlink && blinkedStepKey !== stepKey)

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
    setBlinkedStepKey(null)
    blinkedStepRef.current = null
  }, [isTourActive])

  const isNavigatingToStep =
    !holdNavigation && effectiveRoute !== undefined && pathname !== effectiveRoute
  const isWaitSatisfied = useWaitForSatisfied(step?.waitFor)

  return { holdNavigation, isNavigatingToStep, isWaitSatisfied, tapRect }
}
