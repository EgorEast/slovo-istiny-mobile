import { useAtom } from '@reatom/npm-react'
import { onboardingTourDeckAtom } from '../model/derived'
import { onboardingTargetRectsAtom } from '../model/targets'
import { onboardingTourAtom } from '../model/tour'
import { scenariosById } from './scenarios'
import { deckCardStep, resolveDeckProgress, resolveHiddenDeckIndexes } from './tourDeck'
import { resolveHiddenStepIndexes } from './tourProgress'

// Resolves the active tour's deck, current entry/card and progress for the overlay and
// its navigation hook. Hidden `skipIfMissing` cards leave the deck (with their
// visualizations), so the counter and the last-visible card reflect what the user sees.
export const useTourDeckProgress = () => {
  const [tour] = useAtom(onboardingTourAtom)
  const [deck] = useAtom(onboardingTourDeckAtom)
  const [rects] = useAtom(onboardingTargetRectsAtom)

  const scenarioId = tour?.scenarioId
  const scenario = scenarioId === undefined ? undefined : scenariosById[scenarioId]
  const deckIndex = tour?.deckIndex
  const entry = deckIndex === undefined ? undefined : deck[deckIndex]
  const cardStep =
    scenario === undefined || entry === undefined ? undefined : deckCardStep(scenario.steps, entry)
  const hiddenStepIndexes =
    scenario === undefined ? [] : resolveHiddenStepIndexes(scenario.steps, Object.keys(rects))
  const skippedDeckIndexes = Array.from(
    new Set([
      ...(tour?.skippedDeckIndexes ?? []),
      ...resolveHiddenDeckIndexes(deck, hiddenStepIndexes),
    ]),
  )
  const progress = resolveDeckProgress(deck, skippedDeckIndexes, deckIndex ?? 0)

  return {
    cardStep,
    deckIndex,
    entry,
    progress,
    scenario,
    stepKey: `${scenarioId ?? ''}:${deckIndex ?? ''}`,
  }
}
