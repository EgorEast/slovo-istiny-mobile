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

// The scenario's first screen: the route of its first route-bearing step.
const resolveScenarioFirstScreen = (steps: readonly OnboardingStep[]): Href | undefined =>
  steps.find(step => step.route !== undefined)?.route

// Whether the tour reaches this deck entry from `pathname`: the card belongs to that
// screen (its effective route, inherited when the card declares none), or one of the
// entry transitions attached to it navigates from that screen.
const isEntryReachedFrom = (
  scenario: ScenarioSteps,
  entry: TourDeckEntry,
  pathname: string,
): boolean =>
  resolveStepRoute(scenario, entry.cardIndex) === pathname ||
  entry.entryStepIndexes.some(index => scenario.steps[index].route === pathname)

// The deck entry a same-screen start lands on: the first entry the tour reaches from
// `pathname`, with the whole lead-up — the routeless intro and the tab entries — skipped
// rather than rewound, so the first shown card is the screen's first card. `-1` when no
// entry is reached from it.
export const resolveSameScreenEntryOffset = (
  steps: readonly OnboardingStep[],
  deck: readonly TourDeckEntry[],
  pathname: string,
): number => deck.findIndex(entry => isEntryReachedFrom({ steps }, entry, pathname))

// The deck entry a global scenario or a foreign-screen fallback starts from: the first
// card whose effective route is `pathname`, rewound over leading routeless cards so a
// scenario's opening intro stays. On a non-first screen a card entered through entry
// transitions is itself the resume target, so the routeless cards before it are its
// lead-up and it is returned as-is. `-1` when no card routes there.
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

  const isFirstScreen = pathname === resolveScenarioFirstScreen(steps)
  if (!isFirstScreen && deck[matchIndex].entryStepIndexes.length > 0) return matchIndex

  let startIndex = matchIndex
  while (startIndex > 0 && resolveStepRoute(scenario, deck[startIndex - 1].cardIndex) === undefined)
    startIndex -= 1

  return startIndex
}
