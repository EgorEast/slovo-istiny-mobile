import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scenariosById } from '../lib/scenarios'
import { resolveAreaHoles, resolveTourHole } from '../lib/tourHole'
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
  const { holdNavigation, isOverlayHidden, isWaitSatisfied, tapRect } = useStepNavigation({
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
  // while an action step performs its action (the live UI is the show then), and while
  // a `skipIfMissing` step waits to see whether its target registers at all.
  if (isOverlayHidden) return null

  // The tap hint is a pass-through layer, not a modal: a modal would swallow every
  // touch and freeze the screen the tour is "pressing".
  if (holdNavigation && tapRect !== undefined) return <TourTapLayer rect={tapRect} />

  const isLastStep = tour.stepIndex === scenario.steps.length - 1
  const onPrimary = isLastStep ? end : next

  // Pass-through steps keep the modal unmounted so the live UI stays interactive:
  // an interactive step the user must act on, or a step whose wait condition is
  // unmet yet. The card floats in a pass-through layer; only it is touchable.
  const isPassThrough = step.interactive === true || !isWaitSatisfied
  if (isPassThrough)
    return (
      <TourWaitLayer
        step={step}
        onClose={end}
        onPrev={prev}
        onNext={onPrimary}
        windowWidth={width}
        windowHeight={height}
        index={tour.stepIndex}
        bottomInset={insets.bottom}
        total={scenario.steps.length}
        isWaitSatisfied={isWaitSatisfied}
        hole={activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)}
      />
    )

  // Every other step is a blocking spotlight modal: a target step whose rect is
  // ready, or an area step highlighting clickable zones. The app underneath stays
  // blocked — the onboarding owns the touch, not just the visuals.
  const isAreaStep = step.areaTargetIds !== undefined
  const areaHoles = resolveAreaHoles(step.areaTargetIds, rects)
  const { holes: targetHoles, isWaitingForTarget } = resolveTourHole({
    activeTargetId,
    expiredStepKey,
    height,
    rects,
    stepKey,
  })
  const holes = isAreaStep ? areaHoles : targetHoles

  return (
    <TourSpotlight
      step={step}
      onClose={end}
      onPrev={prev}
      width={width}
      holes={holes}
      height={height}
      onNext={onPrimary}
      stepIndex={tour.stepIndex}
      highlightAreas={isAreaStep}
      total={scenario.steps.length}
      anchorRect={holes[0] ?? null}
      isWaitSatisfied={isWaitSatisfied}
      isWaitingForTarget={isWaitingForTarget}
    />
  )
}
