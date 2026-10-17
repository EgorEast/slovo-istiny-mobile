import { createCtx } from '@reatom/framework'
import { useAtom } from '@reatom/npm-react'
import { act, waitFor } from '@testing-library/react-native'
import { isEmpty } from 'shared/lib/utils/isEmpty'
import { renderHookWithProviders } from 'shared/mocks'
import {
  type OnboardingTargetRect,
  onboardingTargetRectsAtom,
  registerOnboardingTargetRect,
} from '../model/targets'
import { onboardingTourAtom } from '../model/tour'
import { useSkipMissingStep } from './useSkipMissingStep'

const SIBLING_ID = 'playlist.first-row'
const RECT: OnboardingTargetRect = { height: 4, width: 3, x: 1, y: 2 }
// playlist-offline deck index 3 is the `skipIfMissing` «Одна проповедь в офлайн» card.
const SKIP_CARD_DECK_INDEX = 3
const HOLD_WINDOW_MS = 250

const startSkipCardTour = (ctx: ReturnType<typeof createCtx>) =>
  onboardingTourAtom(ctx, {
    deckIndex: SKIP_CARD_DECK_INDEX,
    scenarioId: 'playlist-offline',
    skippedDeckIndexes: [],
  })

const renderSkip = (ctx: ReturnType<typeof createCtx>) =>
  renderHookWithProviders(
    () => {
      const [rects] = useAtom(onboardingTargetRectsAtom)

      return useSkipMissingStep({
        deckIndex: SKIP_CARD_DECK_INDEX,
        hasOtherRegisteredRect: !isEmpty(rects),
        waitingForTarget: true,
      })
    },
    { ctx },
  )

const flush = (ms: number) =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms))
  })

describe('useSkipMissingStep', () => {
  test('skips the card instantly while a sibling target is registered', async () => {
    const ctx = createCtx()
    startSkipCardTour(ctx)
    registerOnboardingTargetRect(ctx, { id: SIBLING_ID, instanceId: 'instance-1', rect: RECT })

    await renderSkip(ctx)

    await waitFor(() => expect(ctx.get(onboardingTourAtom)?.deckIndex).toBe(4), { timeout: 300 })
  })

  test('holds the missing-target window once the sibling rect is released', async () => {
    const ctx = createCtx()
    startSkipCardTour(ctx)
    registerOnboardingTargetRect(ctx, { id: SIBLING_ID, instanceId: 'instance-1', rect: RECT })
    // The sibling unmounts and releases its rect: the registry no longer proves the
    // surface rendered, so the instant-skip must not fire and the hold applies instead.
    registerOnboardingTargetRect(ctx, { id: SIBLING_ID, instanceId: 'instance-1', rect: null })

    await renderSkip(ctx)
    await flush(HOLD_WINDOW_MS)

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
    expect(ctx.get(onboardingTourAtom)?.deckIndex).toBe(SKIP_CARD_DECK_INDEX)
  })
})
