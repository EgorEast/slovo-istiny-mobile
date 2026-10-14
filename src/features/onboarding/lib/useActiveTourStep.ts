import { useAtom } from '@reatom/npm-react'
import { onboardingExitStepIndexAtom } from '../model/tour'
import { type OnboardingScenario, type OnboardingStep } from './scenarios'
import { type TourDeckEntry } from './tourDeck'

interface ActiveTourStep {
  activeStep: OnboardingStep | undefined
  activeStepKey: string
  exitIndex: null | number
  isExitPhase: boolean
}

const resolveActiveStepIndex = (
  entry: TourDeckEntry | undefined,
  exitIndex: null | number,
): number | undefined => {
  if (entry === undefined) return undefined
  if (exitIndex === null) return entry.cardIndex

  return entry.exitStepIndexes[exitIndex]
}

// The step on screen: the deck entry's card, or — during a forward departure — the
// visualization step playing from it. The key differs per visualization, so the tap
// flow restarts its blink for each exit step.
export const useActiveTourStep = ({
  entry,
  scenario,
  stepKey,
}: {
  entry: TourDeckEntry | undefined
  scenario: OnboardingScenario | undefined
  stepKey: string
}): ActiveTourStep => {
  const [exitIndex] = useAtom(onboardingExitStepIndexAtom)
  const isExitPhase = exitIndex !== null && entry !== undefined
  const activeStepIndex = resolveActiveStepIndex(entry, exitIndex)
  const activeStep =
    scenario === undefined || activeStepIndex === undefined
      ? undefined
      : scenario.steps[activeStepIndex]

  return {
    activeStep,
    activeStepKey: isExitPhase ? `${stepKey}:exit:${exitIndex}` : stepKey,
    exitIndex,
    isExitPhase,
  }
}
