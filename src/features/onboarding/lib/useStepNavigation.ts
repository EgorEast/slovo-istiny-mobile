import { useAction, useAtom } from '@reatom/npm-react'
import { useCallback } from 'react'
import { isEmpty } from 'shared/lib/utils/isEmpty'
import { onboardingTargetRectsAtom } from '../model/targets'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  onboardingStepDirectionAtom,
} from '../model/tour'
import { type OnboardingScenario, type OnboardingStep } from './scenarios'
import { type TourDeckEntry } from './tourDeck'
import { useSkipMissingStep } from './useSkipMissingStep'
import { useStepEnterAction } from './useStepEnterAction'
import { useRouteNavigation } from './useStepRoute'
import { useTourEntryStep } from './useTourEntryStep'
import { useTourPhase } from './useTourPhase'
import { useTourVisuals } from './useTourVisuals'
import { useWaitForSatisfied } from './useWaitForSatisfied'

interface StepNavigationInput {
  bottomInset: number
  cardStep: OnboardingStep | undefined
  deckIndex: number | undefined
  entry: TourDeckEntry | undefined
  isLastVisible: boolean
  isTourActive: boolean
  scenario: OnboardingScenario | undefined
  stepKey: string
  viewportHeight: number
}

// Holds navigation while a tap hint blinks on the element the tour "presses", then
// navigates — or, during a card's entry/exit transition, plays each transition (blink
// + navigation/action) and advances the phase itself. A `skipIfMissing` card whose
// target never registers is dropped by useSkipMissingStep.
export const useStepNavigation = ({
  bottomInset,
  cardStep,
  deckIndex,
  entry,
  isLastVisible,
  isTourActive,
  scenario,
  stepKey,
  viewportHeight,
}: StepNavigationInput) => {
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const [stepDirection] = useAtom(onboardingStepDirectionAtom)
  const next = useAction(goToNextOnboardingStep)
  const end = useAction(endOnboardingTour)
  const phase = useTourPhase({ entry, isLastVisible, rects, scenario, stepDirection, stepKey })
  const { holdNavigation, isPerformingAction, isTapPending } = useTourVisuals({
    activeStep: phase.activeStep,
    activeStepKey: phase.activeStepKey,
    bottomInset,
    isActionStep: phase.isActionStep,
    isBlinkAllowed: phase.isBlinkAllowed,
    isFinalExit: phase.isFinalExit,
    isRouteReached: phase.isRouteReached,
    isTapFlow: phase.isTapFlow,
    isTourActive,
    tapRect: phase.tapRect,
    viewportHeight,
  })
  const isEntryDone =
    phase.isEntryPhase && (phase.isEntryStepSkipped || (phase.isRouteReached && !isTapPending))
  useTourEntryStep({
    isEntryDone,
    isEntryPhase: phase.isEntryPhase,
    stepKey: phase.activeStepKey,
  })
  useRouteNavigation({
    effectiveRoute: phase.effectiveRoute,
    holdNavigation: holdNavigation || phase.isEntryStepSkipped,
  })
  useStepEnterAction({
    actionOnEnterId: phase.activeStep?.actionOnEnterId,
    isTourActive,
    stepKey: phase.activeStepKey,
  })

  // A `skipIfMissing` card's own target is unregistered, so any registered rect
  // belongs to another target on the surface — proof the surface rendered its items.
  const skipTargetId = cardStep?.targetId
  const isSkippingStep = useSkipMissingStep({
    deckIndex,
    hasOtherRegisteredRect: !isEmpty(rects),
    waitingForTarget:
      isTourActive &&
      !phase.isExitPhase &&
      !phase.isEntryPhase &&
      cardStep?.skipIfMissing === true &&
      skipTargetId !== undefined &&
      !phase.needsNavigation &&
      rects[skipTargetId] === undefined,
  })

  // The primary button departs the card forward: an entry with visualizations starts
  // its exit transition, the last entry without one ends the tour.
  const goNext = useCallback(() => {
    if (isLastVisible && (entry?.exitStepIndexes.length ?? 0) === 0) {
      end()
      return
    }

    next()
  }, [end, entry, isLastVisible, next])

  // The overlay hides while the router moves to a step's route, while a card's
  // entry/exit transition plays, and while a `skipIfMissing` card waits for its target.
  const isOverlayHidden =
    ((phase.isEntryPhase || phase.needsNavigation) && !isTapPending) ||
    isPerformingAction ||
    isSkippingStep
  const isWaitSatisfied = useWaitForSatisfied(cardStep?.waitFor)

  return {
    goNext,
    holdNavigation,
    isEntryPhase: phase.isEntryPhase,
    isOverlayHidden,
    isWaitSatisfied,
    tapRect: phase.tapRect,
  }
}
