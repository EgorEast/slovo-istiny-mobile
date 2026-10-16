import { createCtx } from '@reatom/framework'
import { waitFor } from '@testing-library/react-native'
import { View } from 'react-native'
import { onboardingTargetRectsAtom, onboardingTourAtom } from 'features/onboarding'
import { renderWithProviders } from 'shared/mocks'
import { MoreMenuSettingsItem } from './MoreMenuSettingsItem'

const TARGET_ID = 'more.offline-item'
const RECT = { height: 4, width: 3, x: 1, y: 2 }

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: jest.fn() }),
}))

const mockMeasureInWindow = () =>
  jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((cb: (x: number, y: number, width: number, height: number) => void) => {
      cb(RECT.x, RECT.y, RECT.width, RECT.height)
      return undefined
    })

const renderItem = (ctx: ReturnType<typeof createCtx>, onboardingTargetId?: string) =>
  renderWithProviders(
    <MoreMenuSettingsItem
      title='Офлайн'
      onPress={jest.fn()}
      onboardingTargetId={onboardingTargetId}
    />,
    { ctx },
  )

describe('<MoreMenuSettingsItem>', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('registers its spotlight rect when given an onboardingTargetId and its step is active', async () => {
    mockMeasureInWindow()
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'offline', skippedDeckIndexes: [] })

    await renderItem(ctx, TARGET_ID)

    await waitFor(() => expect(ctx.get(onboardingTargetRectsAtom)).toEqual({ [TARGET_ID]: RECT }))
  })

  test('registers nothing without an onboardingTargetId', async () => {
    mockMeasureInWindow()
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'offline', skippedDeckIndexes: [] })

    await renderItem(ctx)

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })
})
