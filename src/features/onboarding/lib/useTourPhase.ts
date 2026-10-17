import { usePathname } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { type OnboardingTargetRect } from '../model/targets'
import { resolveStepRoute } from './resolveStepRoute'
import { type OnboardingScenario } from './scenarios'
import { type TourDeckEntry } from './tourDeck'
import { shouldSkipEntryTransition } from './tourEntry'
import { pickOnboardingTargetRect } from './tourHole'
import { useActiveTourStep } from './useActiveTourStep'
import { useStepRoute } from './useStepRoute'

interface TourPhaseInput {
  entry: TourDeckEntry | undefined
  isLastVisible: boolean
  rects: Record<string, Record<string, OnboardingTargetRect>>
  scenario: OnboardingScenario | undefined
  stepDirection: 'backward' | 'forward'
  stepKey: string
}

// Resolves the step on screen and its playback flags: the card, or the entry/exit
// transition playing around it. An entry transition whose screen is already reached is
// marked skipped, so the phase advances instantly without a blink or navigation.
export const useTourPhase = ({
  entry,
  isLastVisible,
  rects,
  scenario,
  stepDirection,
  stepKey,
}: TourPhaseInput) => {
  const pathname = usePathname()
  const { height } = useWindowDimensions()
  const { activeStep, activeStepIndex, activeStepKey, exitIndex, isEntryPhase, isExitPhase } =
    useActiveTourStep({ entry, scenario, stepKey })
  const { effectiveRoute, isRouteReached, needsNavigation } = useStepRoute({
    activeStepIndex,
    isExitPhase,
    scenario,
  })
  const cardRoute =
    scenario === undefined || entry === undefined
      ? undefined
      : resolveStepRoute(scenario, entry.cardIndex)
  const isEntryStepSkipped =
    isEntryPhase && shouldSkipEntryTransition(pathname, effectiveRoute, cardRoute)
  const isActionStep = activeStep?.tapActionId !== undefined

  return {
    activeStep,
    activeStepKey,
    effectiveRoute,
    exitIndex,
    isActionStep,
    // Visualizations are forward-only: the exit blink plays only when the deck departed
    // its card forward (`onboardingStepDirectionAtom` is set by goToNextOnboardingStep).
    isBlinkAllowed: !isExitPhase || stepDirection === 'forward',
    isEntryPhase,
    isEntryStepSkipped,
    isExitPhase,
    isFinalExit:
      isExitPhase && isLastVisible && exitIndex === (entry?.exitStepIndexes.length ?? 1) - 1,
    isRouteReached,
    isTapFlow: (isActionStep || needsNavigation) && !isEntryStepSkipped,
    needsNavigation,
    tapRect:
      activeStep?.tapTargetId === undefined
        ? undefined
        : pickOnboardingTargetRect(rects[activeStep.tapTargetId] ?? {}, height),
  }
}
