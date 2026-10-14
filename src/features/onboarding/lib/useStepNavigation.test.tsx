import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { type OnboardingTargetRect, onboardingTargetRectsAtom } from '../model/targets'
import { onboardingStepDirectionAtom, onboardingTourAtom } from '../model/tour'
import { type OnboardingScenario, type OnboardingStep, scenariosById } from './scenarios'
import { registerTourAction, unregisterTourAction } from './tourActions'
import { useStepNavigation } from './useStepNavigation'

jest.mock('expo-router', () => ({
  usePathname: () => '/listen',
  useRouter: () => ({ navigate: jest.fn() }),
}))

const ACTION_ID = 'demo-action'
const TARGET_ID = 'demo.target'
const STEP_KEY = 'player-description:0'
const TARGET_RECT: OnboardingTargetRect = { height: 4, width: 3, x: 1, y: 2 }
const ACTION_STEP: OnboardingStep = {
  tapActionId: ACTION_ID,
  tapTargetId: TARGET_ID,
  targetId: TARGET_ID,
  text: '',
  title: '',
}
// A trailing card so the action step is not the last visible one: a non-last action
// step advances to it, while a last-step action ends the tour (covered separately).
const FOLLOW_UP_STEP: OnboardingStep = { text: '', title: '' }
const SCENARIO: OnboardingScenario = {
  description: '',
  icon: 'information-circle-outline',
  id: 'player-description',
  steps: [ACTION_STEP, FOLLOW_UP_STEP],
  title: '',
}

// A demonstrative step without a tap target: no blink to hold on, so the action
// must run on step activation.
const TARGETLESS_STEP: OnboardingStep = {
  tapActionId: ACTION_ID,
  text: '',
  title: '',
}
const TARGETLESS_SCENARIO: OnboardingScenario = {
  ...SCENARIO,
  steps: [TARGETLESS_STEP, FOLLOW_UP_STEP],
}

// A one-step deck: its only (action) step is the last visible one.
const LAST_ACTION_SCENARIO: OnboardingScenario = {
  ...SCENARIO,
  steps: [ACTION_STEP],
}

const renderNavigation = (
  rects: Record<string, OnboardingTargetRect> = {},
  direction: 'backward' | 'forward' = 'forward',
) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId: 'player-description', skippedIndexes: [], stepIndex: 0 })
  onboardingStepDirectionAtom(ctx, direction)
  onboardingTargetRectsAtom(ctx, rects)

  return renderHookWithProviders(
    () =>
      useStepNavigation({
        bottomInset: 0,
        isTourActive: true,
        scenario: SCENARIO,
        step: ACTION_STEP,
        stepIndex: 0,
        stepKey: STEP_KEY,
        viewportHeight: 800,
      }),
    { ctx },
  )
}

const renderTargetlessNavigation = () => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId: 'player-description', skippedIndexes: [], stepIndex: 0 })

  return renderHookWithProviders(
    () =>
      useStepNavigation({
        bottomInset: 0,
        isTourActive: true,
        scenario: TARGETLESS_SCENARIO,
        step: TARGETLESS_STEP,
        stepIndex: 0,
        stepKey: STEP_KEY,
        viewportHeight: 800,
      }),
    { ctx },
  )
}

const renderLastStepNavigation = (rects: Record<string, OnboardingTargetRect> = {}) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId: 'player-description', skippedIndexes: [], stepIndex: 0 })
  onboardingStepDirectionAtom(ctx, 'forward')
  onboardingTargetRectsAtom(ctx, rects)

  return renderHookWithProviders(
    () =>
      useStepNavigation({
        bottomInset: 0,
        isTourActive: true,
        scenario: LAST_ACTION_SCENARIO,
        step: ACTION_STEP,
        stepIndex: 0,
        stepKey: STEP_KEY,
        viewportHeight: 800,
      }),
    { ctx },
  )
}

describe('useStepNavigation action steps', () => {
  afterEach(() => {
    unregisterTourAction(ACTION_ID)
  })

  test('blinks on the target, performs the action and advances on its own', async () => {
    const action = jest.fn()
    registerTourAction(ACTION_ID, action)

    const { ctx, result } = await renderNavigation({ [TARGET_ID]: TARGET_RECT })

    // The blink replaces the overlay: navigation is held and the action is not run yet.
    expect(result.current.holdNavigation).toBe(true)
    expect(action).not.toHaveBeenCalled()

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), { timeout: 4500 })
    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'player-description',
          skippedIndexes: [],
          stepIndex: 1,
        }),
      { timeout: 4500 },
    )
  })

  test('advances on its own when the action is missing from the registry', async () => {
    const { ctx } = await renderNavigation({ [TARGET_ID]: TARGET_RECT })

    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'player-description',
          skippedIndexes: [],
          stepIndex: 1,
        }),
      { timeout: 4500 },
    )
  })

  test('performs and advances immediately when the step declares no tap target', async () => {
    const action = jest.fn()
    registerTourAction(ACTION_ID, action)

    const { ctx } = await renderTargetlessNavigation()

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), { timeout: 2000 })
    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'player-description',
          skippedIndexes: [],
          stepIndex: 1,
        }),
      { timeout: 2000 },
    )
  })

  test('ends the tour when the action step is the last visible one', async () => {
    const action = jest.fn()
    registerTourAction(ACTION_ID, action)

    const { ctx } = await renderLastStepNavigation({ [TARGET_ID]: TARGET_RECT })

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), { timeout: 4500 })
    await waitFor(() => expect(ctx.get(onboardingTourAtom)).toBeNull(), { timeout: 4500 })
  })
})

describe('useStepNavigation backward action entries', () => {
  afterEach(() => {
    unregisterTourAction(ACTION_ID)
  })

  test('renders the action step statically without blinking or performing', async () => {
    const action = jest.fn()
    registerTourAction(ACTION_ID, action)

    const { ctx, result } = await renderNavigation({ [TARGET_ID]: TARGET_RECT }, 'backward')

    // No blink/hold on a backward entry, so the card is shown at once.
    expect(result.current.holdNavigation).toBe(false)
    expect(action).not.toHaveBeenCalled()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
    })

    expect(action).not.toHaveBeenCalled()
    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'player-description',
      skippedIndexes: [],
      stepIndex: 0,
    })
  })
})

const PLAYLIST_MENU_SCENARIO = scenariosById['playlist-menu']

const renderPlaylistMenuStep = async (
  stepIndex: number,
  rects: Record<string, OnboardingTargetRect> = {},
) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId: 'playlist-menu', skippedIndexes: [], stepIndex })
  onboardingTargetRectsAtom(ctx, rects)

  return renderHookWithProviders(
    ({ index }: { index: number }) =>
      useStepNavigation({
        bottomInset: 0,
        isTourActive: true,
        scenario: PLAYLIST_MENU_SCENARIO,
        step: PLAYLIST_MENU_SCENARIO.steps[index],
        stepIndex: index,
        stepKey: `playlist-menu:${index}`,
        viewportHeight: 800,
      }),
    { ctx, initialProps: { index: stepIndex } },
  )
}

describe('useStepNavigation skipIfMissing steps', () => {
  test('skips forward a missing step whose target never registers', async () => {
    const { ctx } = await renderPlaylistMenuStep(2)

    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'playlist-menu',
          skippedIndexes: [2],
          stepIndex: 3,
        }),
      { timeout: 2000 },
    )
  })

  test('skips a missing step instantly when a sibling target has registered', async () => {
    // Step 2 targets 'playlist.menu-share'; registering a different menu item proves
    // the open menu rendered its items, so the missing target is dropped at once —
    // no SKIP_MISSING_MS hold (a 300 ms window would miss the 600 ms hold).
    const { ctx } = await renderPlaylistMenuStep(2, { 'playlist.menu-add-all': TARGET_RECT })

    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'playlist-menu',
          skippedIndexes: [2],
          stepIndex: 3,
        }),
      { timeout: 300 },
    )
  })

  test('holds the missing-target window while no target has registered yet', async () => {
    const { ctx } = await renderPlaylistMenuStep(2)

    // Nothing registered: the surface may still be mounting, so the step waits out
    // the hold instead of skipping at once.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 250))
    })

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'playlist-menu',
      skippedIndexes: [],
      stepIndex: 2,
    })
  })

  test('does not skip a missing-capable step whose target is registered', async () => {
    const { ctx } = await renderPlaylistMenuStep(2, { 'playlist.menu-share': TARGET_RECT })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
    })

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'playlist-menu',
      skippedIndexes: [],
      stepIndex: 2,
    })
  })

  test('skips backwards when the user navigated back onto a missing step', async () => {
    const { ctx, rerender } = await renderPlaylistMenuStep(2)

    // Move forward to step 3 and back to 2: the direction ref records «backward»,
    // so the missing step 2 skips to step 0 — step 1 is a forward-only action step.
    await rerender({ index: 3 })
    await rerender({ index: 2 })

    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'playlist-menu',
          skippedIndexes: [2],
          stepIndex: 0,
        }),
      { timeout: 2000 },
    )
  })
})
