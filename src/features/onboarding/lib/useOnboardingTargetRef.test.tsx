import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { View } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import { onboardingTargetRectsAtom, onboardingTourAtom } from '../model'
import { useOnboardingTargetRef } from './useOnboardingTargetRef'

const TARGET_ID = 'listen.search-toggle'
const MEASURE_FLUSH_MS = 150

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

const RefTargetView = ({ id }: { id: string }) => {
  const targetRef = useOnboardingTargetRef(id)

  return <View ref={targetRef} />
}

const renderRefTarget = (ctx: ReturnType<typeof createCtx>) =>
  renderWithProviders(<RefTargetView id={TARGET_ID} />, { ctx })

describe('useOnboardingTargetRef', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('does not register a rect while its step is inactive', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()

    await renderRefTarget(ctx)

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('registers the measured rect of the attached node when its step becomes active', async () => {
    mockMeasureInWindow({ height: 4, width: 3, x: 1, y: 2 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', skippedIndexes: [], stepIndex: 1 })

    await renderRefTarget(ctx)

    await waitFor(() =>
      expect(ctx.get(onboardingTargetRectsAtom)).toEqual({
        [TARGET_ID]: { height: 4, width: 3, x: 1, y: 2 },
      }),
    )
  })

  test('does not register a zero-size rect', async () => {
    mockMeasureInWindow({ height: 0, width: 0, x: 0, y: 0 })
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', skippedIndexes: [], stepIndex: 1 })

    await renderRefTarget(ctx)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, MEASURE_FLUSH_MS))
    })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })
})
