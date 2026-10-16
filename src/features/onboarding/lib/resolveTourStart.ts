import { resolveSameScreenEntryOffset, resolveScenarioEntryOffset } from './resolveStepRoute'
import { type OnboardingScenario } from './scenarios'
import { type TourDeckEntry } from './tourDeck'

const skippedBefore = (entryOffset: number): number[] =>
  Array.from({ length: entryOffset }, (_, index) => index)

// Where a tour starts. Started on one of the scenario's own screens, the whole lead-up
// — the routeless intro and the tab entries — is skipped, so the first shown card is the
// first card of that screen and the counter reads «1 из remaining» («Назад» never
// re-enters the lead-up). A global scenario, or a screen-bound one started on a foreign
// screen, resumes only through entry transitions; every other case starts at 0.
export const resolveTourStart = (
  scenario: OnboardingScenario,
  deck: readonly TourDeckEntry[],
  pathname: string,
): { deckIndex: number; skippedDeckIndexes: number[] } => {
  const isScreenResume = scenario.screens !== undefined && scenario.screens.includes(pathname)
  if (isScreenResume) {
    const screenOffset = resolveSameScreenEntryOffset(scenario.steps, deck, pathname)
    if (screenOffset < 0) return { deckIndex: 0, skippedDeckIndexes: [] }

    return { deckIndex: screenOffset, skippedDeckIndexes: skippedBefore(screenOffset) }
  }

  const entryOffset = resolveScenarioEntryOffset(scenario.steps, deck, pathname)
  const matchedEntry = entryOffset < 0 ? undefined : deck[entryOffset]
  if (matchedEntry === undefined || matchedEntry.entryStepIndexes.length === 0)
    return { deckIndex: 0, skippedDeckIndexes: [] }

  return { deckIndex: entryOffset, skippedDeckIndexes: skippedBefore(entryOffset) }
}
