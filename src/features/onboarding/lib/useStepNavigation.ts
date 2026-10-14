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
import { useActiveTourStep } from './useActiveTourStep'
import { useSkipMissingStep } from './useSkipMissingStep'
import { useStepEnterAction } from './useStepEnterAction'
import { useRouteNavigation, useStepRoute } from './useStepRoute'
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

// Resolves the active card's effective route, holds navigation while a tap hint blinks
// on the element the tour "presses", then navigates — or, during a card's exit
// transition, plays each visualization (blink + action) and advances the deck itself.
// A `skipIfMissing` card whose target never registers is dropped by useSkipMissingStep.
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
  const { activeStep, activeStepKey, exitIndex, isExitPhase } = useActiveTourStep({
    entry,
    scenario,
    stepKey,
  })
  const { effectiveRoute, isRouteReached, needsNavigation } = useStepRoute({
    cardIndex: entry?.cardIndex,
    isExitPhase,
    scenario,
  })

  const isActionStep = activeStep?.tapActionId !== undefined
  // Visualizations are forward-only: the exit blink plays only when the deck departed
  // its card forward (`onboardingStepDirectionAtom` is set by goToNextOnboardingStep).
  const isBlinkAllowed = !isExitPhase || stepDirection === 'forward'
  const isTapFlow = isActionStep || needsNavigation
  const tapRect = activeStep?.tapTargetId === undefined ? undefined : rects[activeStep.tapTargetId]
  const isFinalExit =
    isExitPhase && isLastVisible && exitIndex === (entry?.exitStepIndexes.length ?? 1) - 1
  const { holdNavigation, isPerformingAction, isTapPending } = useTourVisuals({
    activeStep,
    activeStepKey,
    bottomInset,
    isActionStep,
    isBlinkAllowed,
    isFinalExit,
    isRouteReached,
    isTapFlow,
    isTourActive,
    tapRect,
    viewportHeight,
  })
  useRouteNavigation({ effectiveRoute, holdNavigation })
  useStepEnterAction({
    actionOnEnterId: activeStep?.actionOnEnterId,
    isTourActive,
    stepKey: activeStepKey,
  })

  const skipTargetId = cardStep?.targetId
  // A `skipIfMissing` card's own target is unregistered, so any registered rect
  // belongs to another target on the surface — proof the surface rendered its items.
  const isSkippingStep = useSkipMissingStep({
    deckIndex,
    hasOtherRegisteredRect: !isEmpty(rects),
    waitingForTarget:
      isTourActive &&
      !isExitPhase &&
      cardStep?.skipIfMissing === true &&
      skipTargetId !== undefined &&
      !needsNavigation &&
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

  // The overlay hides while the router moves to the route, while an exit visualization
  // performs its action, and while a `skipIfMissing` card waits for its target.
  const isOverlayHidden = (needsNavigation && !isTapPending) || isPerformingAction || isSkippingStep
  const isWaitSatisfied = useWaitForSatisfied(cardStep?.waitFor)

  return {
    goNext,
    holdNavigation,
    isOverlayHidden,
    isWaitSatisfied,
    tapRect,
    tapStepKey: activeStepKey,
  }
}
