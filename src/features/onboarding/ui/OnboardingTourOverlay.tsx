import { useAction, useAtom } from '@reatom/npm-react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scenariosById } from '../lib/scenarios'
import { resolveAreaRects, resolveTourHole } from '../lib/tourHole'
import { resolveHiddenStepIndexes, resolveTourProgress } from '../lib/tourProgress'
import { useExpiredStepKey } from '../lib/useExpiredStepKey'
import { useStepNavigation } from '../lib/useStepNavigation'
import { onboardingTargetRectsAtom } from '../model/targets'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingTourAtom,
} from '../model/tour'
import { TourSpotlight } from './TourSpotlight'
import { TourTapLayer } from './TourTapLayer'
import { TourWaitLayer } from './TourWaitLayer'

export const OnboardingTourOverlay = () => {
  const [tour] = useAtom(onboardingTourAtom)
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const end = useAction(endOnboardingTour)
  const next = useAction(goToNextOnboardingStep)
  const prev = useAction(goToPrevOnboardingStep)
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

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
  const expiredStepKey = useExpiredStepKey({
    activeTargetId,
    isTourActive: tour !== null,
    stepKey,
  })

  if (tour === null || scenario === undefined || step === undefined) return null

  // Hide the overlay while the router plays the real transition to the step's route,
  // while an action step performs its action (the live UI is the show then), and while
  // a `skipIfMissing` step waits to see whether its target registers at all.
  if (isOverlayHidden) return null

  // The tap hint is a pass-through layer, not a modal: a modal would swallow every
  // touch and freeze the screen the tour is "pressing".
  if (holdNavigation && tapRect !== undefined) return <TourTapLayer rect={tapRect} />

  const hiddenIndexes = resolveHiddenStepIndexes(scenario.steps, Object.keys(rects))
  const deckSkippedIndexes = Array.from(new Set([...tour.skippedIndexes, ...hiddenIndexes]))
  const { displayIndex, displayTotal, isFirstVisible, isLastVisible } = resolveTourProgress(
    scenario.steps,
    deckSkippedIndexes,
    tour.stepIndex,
  )
  const onPrimary = isLastVisible ? end : next

  // Pass-through steps keep the modal unmounted so the live UI stays interactive:
  // an interactive step the user must act on, or a step whose wait condition is
  // unmet yet. The card floats in a pass-through layer; only it is touchable.
  // `interactive` wins over `areaTargetIds`: such a step still marks its zones with
  // the pass-through fills instead of the blocking spotlight.
  const areaRects = resolveAreaRects(step.areaTargetIds, rects)
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
        areaRects={areaRects}
        displayIndex={displayIndex}
        displayTotal={displayTotal}
        bottomInset={insets.bottom}
        isLastVisible={isLastVisible}
        isFirstVisible={isFirstVisible}
        isWaitSatisfied={isWaitSatisfied}
        hole={activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)}
      />
    )

  // Every other step is a blocking spotlight modal: a target step whose rect is
  // ready, or an area step highlighting clickable zones. The app underneath stays
  // blocked — the onboarding owns the touch, not just the visuals.
  const isAreaStep = step.areaTargetIds !== undefined
  const { holes: targetHoles, isWaitingForTarget } = resolveTourHole({
    activeTargetId,
    expiredStepKey,
    height,
    rects,
    stepKey,
  })
  const holes = isAreaStep ? areaRects.map(({ rect }) => rect) : targetHoles

  return (
    <TourSpotlight
      step={step}
      onClose={end}
      onPrev={prev}
      width={width}
      holes={holes}
      height={height}
      onNext={onPrimary}
      displayIndex={displayIndex}
      displayTotal={displayTotal}
      highlightAreas={isAreaStep}
      isLastVisible={isLastVisible}
      anchorRect={holes[0] ?? null}
      isFirstVisible={isFirstVisible}
      isWaitSatisfied={isWaitSatisfied}
      isWaitingForTarget={isWaitingForTarget}
    />
  )
}
