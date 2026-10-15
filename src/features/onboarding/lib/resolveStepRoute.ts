import { type Href } from 'expo-router'
import { type OnboardingStep } from './scenarios'
import { type TourDeckEntry } from './tourDeck'

// The steps of a scenario — enough to resolve a step's route.
interface ScenarioSteps {
  steps: readonly OnboardingStep[]
}

// A step without its own `route` stays on the screen of the nearest preceding
// step that has one — the tour keeps the user on the screen the step belongs to.
// Returns `undefined` when no step up to `stepIndex` declares a route.
export const resolveStepRoute = (scenario: ScenarioSteps, stepIndex: number): Href | undefined => {
  for (let index = stepIndex; index >= 0; index -= 1) {
    const route = scenario.steps[index].route
    if (route !== undefined) return route
  }

  return undefined
}

// The deck entry a tour begun on `pathname` starts from: the first card whose
// effective route is `pathname`, rewound over leading routeless cards (a scenario's
// opening card belongs to no screen, so it is not a lead-up to skip). A card entered
// through entry transitions is itself the lead-up target, so the routeless cards
// before it are its lead-up and it is returned as-is. `-1` when no card routes there.
export const resolveScenarioEntryOffset = (
  steps: readonly OnboardingStep[],
  deck: readonly TourDeckEntry[],
  pathname: string,
): number => {
  const scenario = { steps }
  const matchIndex = deck.findIndex(
    entry => resolveStepRoute(scenario, entry.cardIndex) === pathname,
  )
  if (matchIndex < 0) return -1
  if (deck[matchIndex].entryStepIndexes.length > 0) return matchIndex

  let startIndex = matchIndex
  while (startIndex > 0 && resolveStepRoute(scenario, deck[startIndex - 1].cardIndex) === undefined)
    startIndex -= 1

  return startIndex
}
