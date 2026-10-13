import { createCtx } from '@reatom/framework'
import { currentAudioAtom, isPlayingAtom } from 'entities/player/@x/onboarding'
import { renderHookWithProviders } from 'shared/mocks'
import { useWaitForSatisfied } from './useWaitForSatisfied'

const AUDIO = {
  artist: 'Проповедник',
  artwork: null,
  audioUrl: 'https://example.com/sermon.mp3',
  id: 'sermon-1',
  title: 'Проповедь',
}

describe('useWaitForSatisfied', () => {
  test('is always satisfied without a wait condition', async () => {
    const { result } = await renderHookWithProviders(() => useWaitForSatisfied(undefined))

    expect(result.current).toBe(true)
  })

  test('sermonSelected is unsatisfied while nothing is selected', async () => {
    const { result } = await renderHookWithProviders(() => useWaitForSatisfied('sermonSelected'))

    expect(result.current).toBe(false)
  })

  test('sermonSelected is satisfied once a sermon is selected', async () => {
    const ctx = createCtx()
    currentAudioAtom(ctx, AUDIO)

    const { result } = await renderHookWithProviders(() => useWaitForSatisfied('sermonSelected'), {
      ctx,
    })

    expect(result.current).toBe(true)
  })

  test('paused is unsatisfied while playback is running', async () => {
    const ctx = createCtx()
    currentAudioAtom(ctx, AUDIO)
    isPlayingAtom(ctx, true)

    const { result } = await renderHookWithProviders(() => useWaitForSatisfied('paused'), { ctx })

    expect(result.current).toBe(false)
  })

  test('paused is satisfied once playback is paused', async () => {
    const ctx = createCtx()
    currentAudioAtom(ctx, AUDIO)
    isPlayingAtom(ctx, false)

    const { result } = await renderHookWithProviders(() => useWaitForSatisfied('paused'), { ctx })

    expect(result.current).toBe(true)
  })
})
