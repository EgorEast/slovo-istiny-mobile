import { createCtx } from '@reatom/framework'
import { waitFor } from '@testing-library/react-native'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { type OnboardingTargetRect, onboardingTargetRectsAtom, onboardingTourAtom } from '../model'
import { type OnboardingScenario, type OnboardingStep } from './scenarios'
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
const SCENARIO: OnboardingScenario = {
  description: '',
  icon: 'information-circle-outline',
  id: 'player-description',
  steps: [ACTION_STEP],
  title: '',
}

const renderNavigation = (rects: Record<string, OnboardingTargetRect> = {}) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId: 'player-description', stepIndex: 0 })
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
          stepIndex: 1,
        }),
      { timeout: 4500 },
    )
  })
})
