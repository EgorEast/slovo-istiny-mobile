import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { Dimensions, Text, View } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import {
  mockMeasureInWindow as spyMeasureInWindow,
  spyOnMeasureInWindow,
  spyOnMeasureLayout,
} from 'shared/mocks/measure'
import { registerTourScrollable, unregisterTourScrollable } from '../lib/tourScrollable'
import {
  bumpOnboardingScrollEpoch,
  onboardingScrollEpochAtom,
  onboardingTargetRectsAtom,
} from '../model/targets'
import { onboardingTourAtom } from '../model/tour'
import { OnboardingTarget } from './OnboardingTarget'

const TARGET_ID = 'listen.search-toggle'
const MEASURE_FLUSH_MS = 150
const FALLBACK_FLUSH_MS = 700
const POST_SCROLL_BUMP_FLUSH_MS = 800
const VIEWPORT_HEIGHT = 800
const ZERO_RECT = { height: 0, width: 0, x: 0, y: 0 }
const POST_SCROLL_RECT = { height: 50, width: 300, x: 1, y: 200 }
const BELOW_FOLD_RECT = { height: 50, width: 300, x: 0, y: 2000 }
const BELOW_FOLD_SCROLL_OFFSET = 1625
const ABOVE_VIEWPORT_RECT = { height: 50, width: 300, x: 0, y: -120 }
const ABOVE_VIEWPORT_SCROLL_OFFSET = 0
const VISIBLE_RECT = { height: 50, width: 300, x: 0, y: 200 }

// A target id is shared across instances; tests read the single instance's rect by value.
const registeredRectFor = (ctx: ReturnType<typeof createCtx>, id: string) =>
  Object.values(ctx.get(onboardingTargetRectsAtom)[id] ?? {})[0]

const mockAddListener = jest.fn(() => jest.fn())

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: mockAddListener }),
}))

const mockMeasureInWindow = (rect: { height: number; width: number; x: number; y: number }) =>
  spyMeasureInWindow(rect)

// The first measurement (the target's single +100 ms one) reports a clipped zero-size
// rect and never registers; later calls report a real, on-screen rect.
const mockMeasureInWindowSequence = () => {
  let calls = 0
  return spyOnMeasureInWindow().mockImplementation(cb => {
    calls += 1
    const rect = calls === 1 ? ZERO_RECT : POST_SCROLL_RECT
    cb(rect.x, rect.y, rect.width, rect.height)
  })
}

const mockMeasureLayout = (rect: { height: number; width: number; x: number; y: number }) =>
  spyOnMeasureLayout().mockImplementation((_relativeToNativeNode, onSuccess) => {
    onSuccess(rect.x, rect.y, rect.width, rect.height)
  })

const renderTarget = (ctx: ReturnType<typeof createCtx>) =>
  renderWithProviders(
    <OnboardingTarget id={TARGET_ID}>
      <View />
    </OnboardingTarget>,
    { ctx },
  )

// Two mounted instances of the same target id: dropping one must keep the other's rect.
const SharedTargetPair = ({ showFirst }: { showFirst: boolean }) => (
  <>
    {showFirst ? (
      <OnboardingTarget id={TARGET_ID}>
        <View />
      </OnboardingTarget>
    ) : null}
    <OnboardingTarget id={TARGET_ID}>
      <View />
    </OnboardingTarget>
  </>
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
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderTarget(ctx)

    await waitFor(() =>
      expect(registeredRectFor(ctx, TARGET_ID)).toEqual({ height: 4, width: 3, x: 1, y: 2 }),
    )
  })

  test('registers a mounted non-active target while a tour is active', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderWithProviders(
      <OnboardingTarget id='listen.sections'>
        <View />
      </OnboardingTarget>,
      { ctx },
    )

    await waitFor(() =>
      expect(registeredRectFor(ctx, 'listen.sections')).toEqual({
        height: 4,
        width: 3,
        x: 1,
        y: 2,
      }),
    )
  })

  test('releases only the unmounted instance of a shared target id', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    const { rerender } = await renderWithProviders(<SharedTargetPair showFirst />, { ctx })

    await waitFor(() =>
      expect(Object.keys(ctx.get(onboardingTargetRectsAtom)[TARGET_ID] ?? {})).toHaveLength(2),
    )

    await act(async () => {
      rerender(<SharedTargetPair showFirst={false} />)
    })

    expect(Object.keys(ctx.get(onboardingTargetRectsAtom)[TARGET_ID] ?? {})).toHaveLength(1)
  })

  test('re-measures a non-active target when the tour scroll settles', async () => {
    mockMeasureInWindowSequence()
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderWithProviders(
      <OnboardingTarget id='listen.sections'>
        <View />
      </OnboardingTarget>,
      { ctx },
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, MEASURE_FLUSH_MS))
    })
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})

    await act(() => {
      bumpOnboardingScrollEpoch(ctx)
    })

    await waitFor(() => expect(registeredRectFor(ctx, 'listen.sections')).toEqual(POST_SCROLL_RECT))
  })

  test('does not register a zero-size rect', async () => {
    mockMeasureInWindow({ height: 0, width: 0, x: 0, y: 0 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderTarget(ctx)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, MEASURE_FLUSH_MS))
    })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('renders children bare and registers nothing without an id', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

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
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderTarget(ctx)

    await waitFor(() => expect(registeredRectFor(ctx, TARGET_ID)).toEqual(BELOW_FOLD_RECT))
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
    registerTourScrollable({ getInnerViewNode: () => null, scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

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
    registerTourScrollable({ getInnerViewNode: () => null, scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

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
    registerTourScrollable({ getInnerViewNode: () => null, scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderTarget(ctx)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, MEASURE_FLUSH_MS))
    })

    expect(scrollTo).not.toHaveBeenCalled()
  })

  test('scrolls by layout when the clipped target cannot measure', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      fontScale: 1,
      height: VIEWPORT_HEIGHT,
      scale: 1,
      width: 400,
    })
    // A clipped below-fold view reports a zero-size window rect, so it never registers.
    mockMeasureInWindow({ height: 0, width: 0, x: 0, y: 0 })
    const measureLayoutSpy = mockMeasureLayout(BELOW_FOLD_RECT)
    const scrollTo = jest.fn()
    registerTourScrollable({ getInnerViewNode: () => 777, scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })

    await renderTarget(ctx)

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(BELOW_FOLD_SCROLL_OFFSET, true), {
      timeout: 2000,
    })
    expect(measureLayoutSpy).toHaveBeenCalledWith(777, expect.any(Function), expect.any(Function))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, POST_SCROLL_BUMP_FLUSH_MS))
    })
    expect(ctx.get(onboardingScrollEpochAtom)).toBeGreaterThanOrEqual(1)
  })

  test('skips the layout fallback when the rect registers', async () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      fontScale: 1,
      height: VIEWPORT_HEIGHT,
      scale: 1,
      width: 400,
    })
    mockMeasureInWindow(VISIBLE_RECT)
    const measureLayoutSpy = jest
      .spyOn(View.prototype, 'measureLayout')
      .mockImplementation(() => {})
    // `View.prototype.measureLayout` is not restored between tests in this suite, so a
    // previous test's call would otherwise linger; clear it before the assertion.
    measureLayoutSpy.mockClear()
    const scrollTo = jest.fn()
    registerTourScrollable({ getInnerViewNode: () => 777, scrollTo })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'listen', skippedDeckIndexes: [] })
    // The rect is registered before the fallback window can elapse, so the fallback is
    // never scheduled — the assertion must not race the initial measure.
    onboardingTargetRectsAtom(ctx, { [TARGET_ID]: { 'instance-1': VISIBLE_RECT } })

    await renderTarget(ctx)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, FALLBACK_FLUSH_MS))
    })

    expect(scrollTo).not.toHaveBeenCalled()
    expect(measureLayoutSpy).not.toHaveBeenCalled()
  })
})
