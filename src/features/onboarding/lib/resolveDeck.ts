import { type OnboardingScenarioId } from './scenarioId'
import { scenariosById } from './scenarios'
import { buildTourDeck, type TourDeckEntry } from './tourDeck'

// The deck is derived from the active scenario's steps; the actions resolve it on
// demand rather than caching it, so only the position and the skipped entries persist.
export const resolveTourDeck = (scenarioId: OnboardingScenarioId): TourDeckEntry[] =>
  buildTourDeck(scenariosById[scenarioId].steps)

// The entry transition phase a card starts on: the first entry step when the card has
// any, otherwise no phase (`null`).
export const resolveEntryStartIndex = (entry: TourDeckEntry | undefined): null | number =>
  entry !== undefined && entry.entryStepIndexes.length > 0 ? 0 : null
