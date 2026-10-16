import { useAtom } from '@reatom/npm-react'
import { onboardingEntryStepIndexAtom, onboardingExitStepIndexAtom } from '../model/tour'
import { type OnboardingScenario, type OnboardingStep } from './scenarios'
import { type TourDeckEntry } from './tourDeck'

interface ActiveTourStep {
  activeStep: OnboardingStep | undefined
  activeStepIndex: number | undefined
  activeStepKey: string
  entryIndex: null | number
  exitIndex: null | number
  isEntryPhase: boolean
  isExitPhase: boolean
}

const resolveActiveStepIndex = (
  entry: TourDeckEntry | undefined,
  entryIndex: null | number,
  exitIndex: null | number,
): number | undefined => {
  if (entry === undefined) return undefined
  if (entryIndex !== null) return entry.entryStepIndexes[entryIndex]
  if (exitIndex !== null) return entry.exitStepIndexes[exitIndex]

  return entry.cardIndex
}

// The step on screen: the deck entry's card, or — while a transition plays around it —
// the entry/exit step. The key differs per transition, so the tap flow restarts its
// blink for each one.
export const useActiveTourStep = ({
  entry,
  scenario,
  stepKey,
}: {
  entry: TourDeckEntry | undefined
  scenario: OnboardingScenario | undefined
  stepKey: string
}): ActiveTourStep => {
  const [entryIndex] = useAtom(onboardingEntryStepIndexAtom)
  const [exitIndex] = useAtom(onboardingExitStepIndexAtom)
  const isEntryPhase = entryIndex !== null && entry !== undefined
  const isExitPhase = exitIndex !== null && entry !== undefined
  const activeStepIndex = resolveActiveStepIndex(
    entry,
    isEntryPhase ? entryIndex : null,
    isExitPhase ? exitIndex : null,
  )
  const activeStep =
    scenario === undefined || activeStepIndex === undefined
      ? undefined
      : scenario.steps[activeStepIndex]
  const phaseSuffix = isEntryPhase
    ? `:entry:${entryIndex}`
    : isExitPhase
      ? `:exit:${exitIndex}`
      : ''

  return {
    activeStep,
    activeStepIndex,
    activeStepKey: `${stepKey}${phaseSuffix}`,
    entryIndex,
    exitIndex,
    isEntryPhase,
    isExitPhase,
  }
}
