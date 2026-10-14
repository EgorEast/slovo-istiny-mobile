import { resolveScenarioEntryOffset } from './resolveStepRoute'
import { type OnboardingScenario } from './scenarios'
import { type TourDeckEntry } from './tourDeck'

// Where a tour starts. Started from a screen the scenario visits mid-tour, the
// lead-up cards that navigate to it are pre-skipped, so the counter reads
// «1 из remaining» and «Назад» never re-enters them. Global scenarios and first
// screens start at 0.
export const resolveTourStart = (
  scenario: OnboardingScenario,
  deck: readonly TourDeckEntry[],
  pathname: string,
): { deckIndex: number; skippedDeckIndexes: number[] } => {
  const entryOffset = resolveScenarioEntryOffset(scenario.steps, deck, pathname)
  const isResuming =
    scenario.screens !== undefined && scenario.screens.includes(pathname) && entryOffset >= 0
  if (!isResuming) return { deckIndex: 0, skippedDeckIndexes: [] }

  return {
    deckIndex: entryOffset,
    skippedDeckIndexes: Array.from({ length: entryOffset }, (_, index) => index),
  }
}
