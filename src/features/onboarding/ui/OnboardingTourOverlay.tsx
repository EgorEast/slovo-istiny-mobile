import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scenariosById } from '../lib/scenarios'
import { useStepNavigation } from '../lib/useStepNavigation'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingTargetRectsAtom,
  onboardingTourAtom,
} from '../model'
import { TourSpotlight } from './TourSpotlight'
import { TourTapLayer } from './TourTapLayer'
import { TourWaitLayer } from './TourWaitLayer'

const MISSING_TARGET_TIMEOUT_MS = 1200

export const OnboardingTourOverlay = () => {
  const [tour] = useAtom(onboardingTourAtom)
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const end = useAction(endOnboardingTour)
  const next = useAction(goToNextOnboardingStep)
  const prev = useAction(goToPrevOnboardingStep)
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [expiredStepKey, setExpiredStepKey] = useState<null | string>(null)

  const scenarioId = tour?.scenarioId
  const stepIndex = tour?.stepIndex
  const stepKey = `${scenarioId ?? ''}:${stepIndex ?? ''}`
  const scenario = scenarioId === undefined ? undefined : scenariosById[scenarioId]
  const step =
    scenario === undefined || stepIndex === undefined ? undefined : scenario.steps[stepIndex]
  const activeTargetId = step?.targetId
  const { holdNavigation, isNavigatingToStep, isPerformingAction, isWaitSatisfied, tapRect } =
    useStepNavigation({
      bottomInset: insets.bottom,
      isTourActive: tour !== null,
      scenario,
      step,
      stepIndex,
      stepKey,
      viewportHeight: height,
    })

  useEffect(() => {
    if (activeTargetId === undefined) return

    const timer = setTimeout(() => setExpiredStepKey(stepKey), MISSING_TARGET_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [activeTargetId, stepKey])

  useEffect(() => {
    if (tour) return

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect -- reset stale per-tour UI state when the tour ends
    setExpiredStepKey(null)
  }, [tour])

  if (tour === null || scenario === undefined || step === undefined) return null

  // Hide the overlay while the router plays the real transition to the step's route,
  // and while an action step performs its action (the live UI is the show then).
  if (isNavigatingToStep || isPerformingAction) return null

  // The tap hint is a pass-through layer, not a modal: a modal would swallow every
  // touch and freeze the screen the tour is "pressing".
  if (holdNavigation && tapRect !== undefined) return <TourTapLayer rect={tapRect} />

  const isLastStep = tour.stepIndex === scenario.steps.length - 1
  const onPrimary = isLastStep ? end : next

  // While an interactive step's condition is unmet, keep the modal unmounted so the
  // user can actually perform the action on the live UI; the card floats in a
  // pass-through layer and only the card itself is touchable.
  if (!isWaitSatisfied)
    return (
      <TourWaitLayer
        step={step}
        onClose={end}
        onPrev={prev}
        onNext={onPrimary}
        windowHeight={height}
        index={tour.stepIndex}
        bottomInset={insets.bottom}
        total={scenario.steps.length}
        hole={activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)}
      />
    )

  return (
    <TourSpotlight
      step={step}
      onClose={end}
      onPrev={prev}
      rects={rects}
      width={width}
      height={height}
      stepKey={stepKey}
      onNext={onPrimary}
      stepIndex={tour.stepIndex}
      total={scenario.steps.length}
      activeTargetId={activeTargetId}
      expiredStepKey={expiredStepKey}
      isWaitSatisfied={isWaitSatisfied}
    />
  )
}
