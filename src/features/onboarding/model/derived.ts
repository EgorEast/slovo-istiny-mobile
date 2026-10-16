import { atom } from '@reatom/framework'
import { scenariosById } from '../lib/scenarios'
import { buildTourDeck } from '../lib/tourDeck'
import {
  onboardingEntryStepIndexAtom,
  onboardingExitStepIndexAtom,
  onboardingTourAtom,
} from './tour'

// The deck derived from the active scenario: cards, each carrying its entry
// transitions and trailing action steps. Deriving it keeps the state lean — only the
// position and the skipped entries persist.
export const onboardingTourDeckAtom = atom(ctx => {
  const tour = ctx.spy(onboardingTourAtom)
  return tour === null ? [] : buildTourDeck(scenariosById[tour.scenarioId].steps)
}, 'onboardingTourDeckAtom')

// The step currently on screen: the card, or — during an entry/exit transition — the
// transition playing around it. Target measuring follows this.
export const onboardingActiveStepIndexAtom = atom(ctx => {
  const tour = ctx.spy(onboardingTourAtom)
  if (tour === null) return null

  const deck = ctx.spy(onboardingTourDeckAtom)
  const entry = deck[tour.deckIndex]
  if (entry === undefined) return null

  const entryIndex = ctx.spy(onboardingEntryStepIndexAtom)
  if (entryIndex !== null) return entry.entryStepIndexes[entryIndex] ?? entry.cardIndex

  const exitIndex = ctx.spy(onboardingExitStepIndexAtom)
  return exitIndex === null
    ? entry.cardIndex
    : (entry.exitStepIndexes[exitIndex] ?? entry.cardIndex)
}, 'onboardingActiveStepIndexAtom')
