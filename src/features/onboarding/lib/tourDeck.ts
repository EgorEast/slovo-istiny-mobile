import { type OnboardingStep } from './scenarios'

// A card (a step without `tapActionId`) and the visualization steps that follow it.
// Visualizations are not tour steps: they play as the card's exit transition when the
// tour departs it forward.
export interface TourDeckEntry {
  cardIndex: number
  exitStepIndexes: number[]
}

export interface TourDeckProgress {
  displayIndex: number
  displayTotal: number
  isFirstVisible: boolean
  isLastVisible: boolean
}

// Builds the deck: cards become entries, consecutive `tapActionId` steps attach to
// the preceding card as its `exitStepIndexes` (played in order). Leading action steps
// violate the authoring rule (a tour starts with a card) and are dropped, loudly.
export const buildTourDeck = (steps: readonly OnboardingStep[]): TourDeckEntry[] => {
  const deck: TourDeckEntry[] = []
  const leadingActionIndexes: number[] = []
  let pendingExitIndexes: number[] = []

  steps.forEach((step, index) => {
    if (step.tapActionId !== undefined) {
      if (deck.length === 0) leadingActionIndexes.push(index)
      else pendingExitIndexes.push(index)
      return
    }

    const previousEntry = deck[deck.length - 1]
    if (previousEntry !== undefined && pendingExitIndexes.length > 0) {
      previousEntry.exitStepIndexes.push(...pendingExitIndexes)
      pendingExitIndexes = []
    }
    deck.push({ cardIndex: index, exitStepIndexes: [] })
  })

  const lastEntry = deck[deck.length - 1]
  if (lastEntry !== undefined && pendingExitIndexes.length > 0)
    lastEntry.exitStepIndexes.push(...pendingExitIndexes)

  if (leadingActionIndexes.length > 0)
    console.warn(
      `onboarding: dropped leading action step(s) at ${leadingActionIndexes.join(', ')} — a tour must start with a card`,
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
