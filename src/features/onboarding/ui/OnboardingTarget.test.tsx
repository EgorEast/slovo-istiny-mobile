import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { Dimensions, Text, View } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import { registerTourScrollable, unregisterTourScrollable } from '../lib/tourScrollable'
import { onboardingTargetRectsAtom, onboardingTourAtom } from '../model'
import { OnboardingTarget } from './OnboardingTarget'

const TARGET_ID = 'listen.search-toggle'
const MEASURE_FLUSH_MS = 150
const VIEWPORT_HEIGHT = 800
const BELOW_FOLD_RECT = { height: 50, width: 300, x: 0, y: 2000 }
const BELOW_FOLD_SCROLL_OFFSET = 1625
const ABOVE_VIEWPORT_RECT = { height: 50, width: 300, x: 0, y: -120 }
const ABOVE_VIEWPORT_SCROLL_OFFSET = 0
const VISIBLE_RECT = { height: 50, width: 300, x: 0, y: 200 }

const mockAddListener = jest.fn(() => jest.fn())

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: mockAddListener }),
}))

const mockMeasureInWindow = (rect: { height: number; width: number; x: number; y: number }) =>
  jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((cb: (x: number, y: number, width: number, height: number) => void) => {
      cb(rect.x, rect.y, rect.width, rect.height)
      return undefined
    })

const renderTarget = (ctx: ReturnType<typeof createCtx>) =>
  renderWithProviders(
    <OnboardingTarget id={TARGET_ID}>
      <View />
    </OnboardingTarget>,
    { ctx },
  )

describe('<OnboardingTarget>', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    unregisterTourScrollable()
  })

  test('does not register a rect while its step is inactive', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()

    await renderTarget(ctx)

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('registers the measured rect when its step becomes active', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderTarget(ctx)

    await waitFor(() =>
      expect(ctx.get(onboardingTargetRectsAtom)).toEqual({
        [TARGET_ID]: { height: 4, width: 3, x: 1, y: 2 },
      }),
    )
  })

  test('registers a mounted non-active target while a tour is active', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderWithProviders(
      <OnboardingTarget id='listen.sections'>
        <View />
      </OnboardingTarget>,
      { ctx },
    )

    await waitFor(() =>
      expect(ctx.get(onboardingTargetRectsAtom)).toEqual({
        'listen.sections': { height: 4, width: 3, x: 1, y: 2 },
      }),
    )
  })

  test('does not register a zero-size rect', async () => {
    mockMeasureInWindow({ height: 0, width: 0, x: 0, y: 0 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderTarget(ctx)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, MEASURE_FLUSH_MS))
    })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('renders children bare and registers nothing without an id', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    const { getByText } = await renderWithProviders(
      <OnboardingTarget>
        <Text>bare child</Text>
      </OnboardingTarget>,
      { ctx },
    )

    expect(getByText('bare child')).toBeTruthy()
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('registers a below-fold rect without a scrollable and does not crash', async () => {
    mockMeasureInWindow(BELOW_FOLD_RECT)
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderTarget(ctx)

    await waitFor(() =>
      expect(ctx.get(onboardingTargetRectsAtom)).toEqual({ [TARGET_ID]: BELOW_FOLD_RECT }),
    )
  })

  test('scrolls a below-fold target into view and re-measures', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      fontScale: 1,
      height: VIEWPORT_HEIGHT,
      scale: 1,
      width: 400,
    })
    const measureSpy = mockMeasureInWindow(BELOW_FOLD_RECT)
    const scrollTo = jest.fn()
    registerTourScrollable({ scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderTarget(ctx)

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(BELOW_FOLD_SCROLL_OFFSET, true), {
      timeout: 2000,
    })
    await waitFor(() => expect(measureSpy.mock.calls.length).toBeGreaterThanOrEqual(3), {
      timeout: 2000,
    })
  })

  test('scrolls a target that sits above the viewport back into view', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      fontScale: 1,
      height: VIEWPORT_HEIGHT,
      scale: 1,
      width: 400,
    })
    mockMeasureInWindow(ABOVE_VIEWPORT_RECT)
    const scrollTo = jest.fn()
    registerTourScrollable({ scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderTarget(ctx)

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(ABOVE_VIEWPORT_SCROLL_OFFSET, true), {
      timeout: 2000,
    })
  })

  test('does not scroll when the target is fully visible', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      fontScale: 1,
      height: VIEWPORT_HEIGHT,
      scale: 1,
      width: 400,
    })
    mockMeasureInWindow(VISIBLE_RECT)
    const scrollTo = jest.fn()
    registerTourScrollable({ scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 1 })

    await renderTarget(ctx)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, MEASURE_FLUSH_MS))
    })

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
