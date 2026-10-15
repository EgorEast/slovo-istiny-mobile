import { resolveScenarioEntryOffset } from './resolveStepRoute'
import { type OnboardingScenario } from './scenarios'
import { type TourDeckEntry } from './tourDeck'

// Where a tour starts. Started from a screen the scenario visits mid-tour, the lead-up
// that navigates to it is pre-skipped, so the counter reads «1 из remaining» and
// «Назад» never re-enters it. A screen-bound scenario resumes on its declared screens;
// a global scenario resumes only through entry transitions (the card is entered through
// them). Every other case starts at 0.
export const resolveTourStart = (
  scenario: OnboardingScenario,
  deck: readonly TourDeckEntry[],
  pathname: string,
): { deckIndex: number; skippedDeckIndexes: number[] } => {
  const entryOffset = resolveScenarioEntryOffset(scenario.steps, deck, pathname)
  const matchedEntry = entryOffset < 0 ? undefined : deck[entryOffset]
  const isScreenResume = scenario.screens !== undefined && scenario.screens.includes(pathname)
  const isEntryResume = (matchedEntry?.entryStepIndexes.length ?? 0) > 0
  if (entryOffset < 0 || (!isScreenResume && !isEntryResume))
    return { deckIndex: 0, skippedDeckIndexes: [] }

  return {
    deckIndex: entryOffset,
    skippedDeckIndexes: Array.from({ length: entryOffset }, (_, index) => index),
  }
}
