import { createCtx } from '@reatom/framework'
import { act } from '@testing-library/react-native'
import { type View } from 'react-native'
import { renderHookWithProviders } from 'shared/mocks'
import { endOnboardingTour, onboardingTargetRectsAtom, onboardingTourAtom } from '../model'
import { useTargetMeasure } from './useTargetMeasure'

const TARGET_ID = 'listen.search-toggle'
const SAMPLE_WINDOW_MS = 700

const mockAddListener = jest.fn(() => jest.fn())

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: mockAddListener }),
}))

type MeasureCallback = (x: number, y: number, width: number, height: number) => void

// The hook only calls `measureInWindow` on the node, so a minimal stand-in is
// enough to drive it without mounting a real View.
const createNode = (measureInWindow: (callback: MeasureCallback) => void) =>
  ({ measureInWindow }) as unknown as View

const renderMeasure = (getNode: () => null | View, ctx: ReturnType<typeof createCtx>) =>
  renderHookWithProviders(() => useTargetMeasure({ getNode, id: TARGET_ID }), { ctx })

const activateTarget = (ctx: ReturnType<typeof createCtx>) => {
  onboardingTourAtom(ctx, { scenarioId: 'listen', skippedIndexes: [], stepIndex: 1 })
}

const flush = (ms: number) =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms))
  })

describe('useTargetMeasure', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('re-measures the active target on a bounded schedule', async () => {
    const measure = jest.fn()
    const ctx = createCtx()
    activateTarget(ctx)

    await renderMeasure(() => createNode(measure), ctx)
    await flush(SAMPLE_WINDOW_MS)

    // The 100ms and 500ms samples fired; the 1200ms and 2500ms ones have not.
    expect(measure).toHaveBeenCalledTimes(2)
  })

  test('updates the registry when the rect changes between samples', async () => {
    const ctx = createCtx()
    activateTarget(ctx)
    let calls = 0
    const getNode = () =>
      createNode(callback => {
        calls += 1
        callback(calls, calls, 10, 20)
      })

    await renderMeasure(getNode, ctx)
    await flush(SAMPLE_WINDOW_MS)

    expect(ctx.get(onboardingTargetRectsAtom)[TARGET_ID]).toEqual({
      height: 20,
      width: 10,
      x: 2,
      y: 2,
    })
  })

  test('does not rewrite the registry when the rect is unchanged', async () => {
    const ctx = createCtx()
    activateTarget(ctx)

    await renderMeasure(() => createNode(callback => callback(1, 2, 3, 4)), ctx)
    await flush(150)
    const settledRects = ctx.get(onboardingTargetRectsAtom)

    await flush(SAMPLE_WINDOW_MS)

    expect(ctx.get(onboardingTargetRectsAtom)).toBe(settledRects)
  })

  test('clears pending samples when the target deactivates', async () => {
    const measure = jest.fn()
    const ctx = createCtx()
    activateTarget(ctx)

    await renderMeasure(() => createNode(measure), ctx)
    await flush(150)
    const callsAfterFirstSample = measure.mock.calls.length

    await act(async () => {
      endOnboardingTour(ctx)
    })
    await flush(SAMPLE_WINDOW_MS)

    expect(measure.mock.calls.length).toBe(callsAfterFirstSample)
  })
})
