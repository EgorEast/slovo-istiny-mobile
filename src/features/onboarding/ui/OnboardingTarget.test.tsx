import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import { onboardingTargetRectsAtom, onboardingTourAtom } from '../model'
import { OnboardingTarget } from './OnboardingTarget'

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
})
