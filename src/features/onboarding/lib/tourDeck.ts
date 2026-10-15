import { type OnboardingStep } from './scenarios'

// A card (a step without `tapActionId` that is not an entry transition) and the steps
// that play as transitions around it: entry transitions navigate into the card, exit
// visualizations perform an action on departure. Neither is counted as a tour step.
export interface TourDeckEntry {
  cardIndex: number
  entryStepIndexes: number[]
  exitStepIndexes: number[]
}

export interface TourDeckProgress {
  displayIndex: number
  displayTotal: number
  isFirstVisible: boolean
  isLastVisible: boolean
}

// A step that navigates/blinks into the card it precedes: it has a tap target and a
// route but nothing to spotlight (`targetId`) or perform (`tapActionId`). The
// scenario's opening step is never one — a tour must start with a card, so a leading
// tap step stays the opening card.
const isEntryTransitionStep = (step: OnboardingStep, index: number): boolean =>
  index > 0 &&
  step.tapTargetId !== undefined &&
  step.targetId === undefined &&
  step.tapActionId === undefined

// Builds the deck: cards become entries, consecutive `tapActionId` steps attach to
// the preceding card as its `exitStepIndexes` and consecutive entry-transition steps
// attach to the following card as its `entryStepIndexes` (both played in order).
// Leading action steps and trailing entry transitions violate the authoring rules and
// are dropped, loudly.
export const buildTourDeck = (steps: readonly OnboardingStep[]): TourDeckEntry[] => {
  const deck: TourDeckEntry[] = []
  const leadingActionIndexes: number[] = []
  let pendingEntryIndexes: number[] = []
  let pendingExitIndexes: number[] = []

  steps.forEach((step, index) => {
    if (isEntryTransitionStep(step, index)) {
      pendingEntryIndexes.push(index)
      return
    }
    if (step.tapActionId !== undefined) {
      if (deck.length === 0) leadingActionIndexes.push(index)
      else pendingExitIndexes.push(index)
      return
    }

    const previousEntry = deck[deck.length - 1]
    if (previousEntry !== undefined && pendingExitIndexes.length > 0)
      previousEntry.exitStepIndexes.push(...pendingExitIndexes)
    pendingExitIndexes = []

    deck.push({ cardIndex: index, entryStepIndexes: pendingEntryIndexes, exitStepIndexes: [] })
    pendingEntryIndexes = []
  })

  const lastEntry = deck[deck.length - 1]
  if (lastEntry !== undefined && pendingExitIndexes.length > 0)
    lastEntry.exitStepIndexes.push(...pendingExitIndexes)

  if (leadingActionIndexes.length > 0)
    console.warn(
      `onboarding: dropped leading action step(s) at ${leadingActionIndexes.join(', ')} — a tour must start with a card`,
    )
  if (pendingEntryIndexes.length > 0)
    console.warn(
      `onboarding: dropped trailing entry transition step(s) at ${pendingEntryIndexes.join(', ')} — an entry transition must precede a card`,
    )

  return deck
}

export const deckCardStep = (
  steps: readonly OnboardingStep[],
  entry: TourDeckEntry,
): OnboardingStep => steps[entry.cardIndex]

// Where the current deck entry sits among the visible cards: skipped entries are
// removed, so the counter shows real numbers and the last visible card closes the
// tour. `displayIndex` is 0-based over the surviving cards.
export const resolveDeckProgress = (
  deck: readonly TourDeckEntry[],
  skippedDeckIndexes: number[],
  deckIndex: number,
): TourDeckProgress => {
  const skipped = new Set(skippedDeckIndexes.filter(index => index >= 0 && index < deck.length))
  const visibleIndexes = deck.map((_, index) => index).filter(index => !skipped.has(index))
  const displayTotal = visibleIndexes.length
  const displayIndex = visibleIndexes.indexOf(deckIndex)

  return {
    displayIndex,
    displayTotal,
    isFirstVisible: visibleIndexes[0] === deckIndex,
    isLastVisible: visibleIndexes[displayTotal - 1] === deckIndex,
  }
}

// Deck entries whose card is a hidden `skipIfMissing` target: the entry and its exit
// visualizations leave the deck together.
export const resolveHiddenDeckIndexes = (
  deck: readonly TourDeckEntry[],
  hiddenStepIndexes: readonly number[],
): number[] => {
  const hidden = new Set(hiddenStepIndexes)

  return deck.flatMap((entry, deckIndex) => (hidden.has(entry.cardIndex) ? [deckIndex] : []))
}

// The nearest deck entry that is still in the deck, walking `direction` from
// `fromIndex`. `undefined` means every entry that way is gone — the deck boundary.
export const findNearestDeckIndex = (
  deck: readonly TourDeckEntry[],
  skippedDeckIndexes: number[],
  fromIndex: number,
  direction: -1 | 1,
): number | undefined => {
  for (let index = fromIndex + direction; index >= 0 && index < deck.length; index += direction) {
    if (skippedDeckIndexes.includes(index)) continue

    return index
  }

  return undefined
}
