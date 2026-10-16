import { type OnboardingScenario } from './scenarios'

// A scenario is local to the exact route it names; matching is exact (`pathname`),
// no prefix matching.
export const isScenarioOnScreen = (scenario: OnboardingScenario, pathname: string) =>
  scenario.screens?.includes(pathname) ?? false

// A `globalFallback` scenario is local to its own screens but stays in «Глобальные»
// everywhere else — its lead-up starts on one of its screens (search, backup, share).
// A plain screen-bound scenario has no fallback and is hidden on foreign screens.
export const isGlobalScenario = (scenario: OnboardingScenario, pathname: string) =>
  scenario.screens === undefined ||
  (scenario.globalFallback === true && !isScenarioOnScreen(scenario, pathname))
