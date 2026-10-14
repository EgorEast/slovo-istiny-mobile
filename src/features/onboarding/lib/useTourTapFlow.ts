import { useEffect, useRef, useState } from 'react'
import { type OnboardingTargetRect } from '../model'
import { type OnboardingStep } from './scenarios'
import { isRectOutsideViewport } from './tourScrollable'

// A tap hint blinks three times (~800ms each) before the tour proceeds.
const TAP_PHASE_MS = 2400
// Starting a tour wipes the rect registry, so the first navigation can fire before
// the tap target's rect is measured. Navigation is held this long for the rect to
// register: if it does, the blink plays; otherwise the tour moves on without it.
const HOLD_FOR_TAP_MS = 500

interface TourTapFlowInput {
  bottomInset: number
  isBackwardActionEntry: boolean
  isRouteReached: boolean
  isTapFlow: boolean
  isTourActive: boolean
  step: OnboardingStep | undefined
  stepKey: string
  tapRect: OnboardingTargetRect | undefined
  viewportHeight: number
}

// Holds navigation while a declared tap target's rect registers, blinks three pulses
// on the live UI, then lets the caller proceed. Route steps navigate once the blink is
// done; action steps (useTourActionStep) perform their action instead. An action step
// entered backward is shown statically: no hold and no blink.
export const useTourTapFlow = ({
  bottomInset,
  isBackwardActionEntry,
  isRouteReached,
  isTapFlow,
  isTourActive,
  step,
  stepKey,
  tapRect,
  viewportHeight,
}: TourTapFlowInput) => {
  const [phaseStepKey, setPhaseStepKey] = useState<null | string>(null)
  const [blinkedStepKey, setBlinkedStepKey] = useState<null | string>(null)
  const [holdExpiredStepKey, setHoldExpiredStepKey] = useState<null | string>(null)
  const blinkedStepRef = useRef<null | string>(null)

  const shouldBlink =
    isTourActive &&
    isTapFlow &&
    !isBackwardActionEntry &&
    tapRect !== undefined &&
    !isRectOutsideViewport(tapRect, viewportHeight, bottomInset)
  const isTapPhase = phaseStepKey === stepKey
  const isBlinkPending = shouldBlink && blinkedStepKey !== stepKey
  const isAwaitingTapRect =
    isTourActive &&
    isTapFlow &&
    !isBackwardActionEntry &&
    step?.tapTargetId !== undefined &&
    tapRect === undefined
  const isHoldingForTapRect = isAwaitingTapRect && holdExpiredStepKey !== stepKey
  const holdNavigation = isTapPhase || isBlinkPending || isHoldingForTapRect
  const isTapPending = isTapPhase || isBlinkPending

  useEffect(() => {
    if (!shouldBlink) return
    if (holdExpiredStepKey === stepKey) return
    if (blinkedStepRef.current === stepKey) return

    blinkedStepRef.current = stepKey
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- mark the step as blinked
    setBlinkedStepKey(stepKey)
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- start the blink phase on step activation
    setPhaseStepKey(stepKey)
    const timer = setTimeout(() => setPhaseStepKey(null), TAP_PHASE_MS)
    return () => clearTimeout(timer)
  }, [holdExpiredStepKey, shouldBlink, stepKey])

  // Wait briefly for a declared tap target's rect before proceeding without a hint.
  useEffect(() => {
    if (!isHoldingForTapRect) return

    const timer = setTimeout(() => setHoldExpiredStepKey(stepKey), HOLD_FOR_TAP_MS)
    return () => clearTimeout(timer)
  }, [isHoldingForTapRect, stepKey])

  // Self-navigation race: the user reaches the step's route during the blink, so the
  // hint is stale — cancel the phase (the blink timer is cleared by its cleanup).
  useEffect(() => {
    if (!isTapPhase || !isRouteReached) return

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect -- pathname reached the effective route
    setPhaseStepKey(null)
  }, [isRouteReached, isTapPhase])

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

  return {
    blinkedStepKey,
    holdExpiredStepKey,
    holdNavigation,
    isHoldingForTapRect,
    isTapPending,
    isTapPhase,
  }
}
