import { useAction, useAtom } from '@reatom/npm-react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { resolveAreaRects, resolveTourHole } from '../lib/tourHole'
import { useExpiredStepKey } from '../lib/useExpiredStepKey'
import { useStepNavigation } from '../lib/useStepNavigation'
import { useTourDeckProgress } from '../lib/useTourDeckProgress'
import { onboardingTargetRectsAtom } from '../model/targets'
import { endOnboardingTour, goToPrevOnboardingStep, onboardingTourAtom } from '../model/tour'
import { TourSpotlight } from './TourSpotlight'
import { TourTapLayer } from './TourTapLayer'
import { TourWaitLayer } from './TourWaitLayer'

export const OnboardingTourOverlay = () => {
  const [tour] = useAtom(onboardingTourAtom)
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const end = useAction(endOnboardingTour)
  const prev = useAction(goToPrevOnboardingStep)
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const { cardStep, deckIndex, entry, progress, scenario, stepKey } = useTourDeckProgress()
  const { displayIndex, displayTotal, isFirstVisible, isLastVisible } = progress
  const activeTargetId = cardStep?.targetId

  const {
    goNext,
    holdNavigation,
    isEntryPhase,
    isOverlayHidden,
    isWaitSatisfied,
    tapRect,
    tapStepKey,
  } = useStepNavigation({
    bottomInset: insets.bottom,
    cardStep,
    deckIndex,
    entry,
    isLastVisible,
    isTourActive: tour !== null,
    scenario,
    stepKey,
    viewportHeight: height,
  })
  // An entry transition plays before the card lands, so the card's missing-target
  // timer must not start until the phase is over (otherwise it expires mid-lead-up).
  const expiredStepKey = useExpiredStepKey({
    activeTargetId: isEntryPhase ? undefined : cardStep?.targetId,
    isTourActive: tour !== null,
    stepKey,
  })

  if (tour === null || scenario === undefined || entry === undefined || cardStep === undefined)
    return null

  // Hide the overlay while the router plays the real transition to the card's route,
  // while an exit visualization performs its action (the live UI is the show then),
  // and while a `skipIfMissing` card waits to see whether its target registers at all.
  if (isOverlayHidden) return null

  // The tap hint (route navigation or exit visualization) is presented in its own
  // native window, a Modal keyed per step.
  if (holdNavigation && tapRect !== undefined)
    return <TourTapLayer onClose={end} rect={tapRect} stepKey={tapStepKey} />

  // Pass-through steps keep the modal unmounted so the live UI stays interactive:
  // an interactive card the user must act on, or a card whose wait condition is unmet
  // yet. The card floats in a pass-through layer; only it is touchable.
  const areaRects = resolveAreaRects(cardStep.areaTargetIds, rects)
  const isPassThrough = cardStep.interactive === true || !isWaitSatisfied
  if (isPassThrough)
    return (
      <TourWaitLayer
        onClose={end}
        onPrev={prev}
        step={cardStep}
        onNext={goNext}
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

  // Every other card is a blocking spotlight modal: a target card whose rect is ready,
  // or an area card highlighting zones. The app underneath stays blocked, not just visual.
  const isAreaStep = cardStep.areaTargetIds !== undefined
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
      onClose={end}
      onPrev={prev}
      width={width}
      holes={holes}
      step={cardStep}
      height={height}
      onNext={goNext}
      stepKey={stepKey}
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
