import { createCtx } from '@reatom/framework'
import { waitFor } from '@testing-library/react-native'
import { onboardingTargetRectsAtom, onboardingTourAtom } from 'features/onboarding'
import { renderWithProviders } from 'shared/mocks'
import { mockMeasureInWindow } from 'shared/mocks/measure'
import { MoreMenuSettingsItem } from './MoreMenuSettingsItem'

const TARGET_ID = 'more.offline-item'
const RECT = { height: 4, width: 3, x: 1, y: 2 }

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: jest.fn() }),
}))

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
    mockMeasureInWindow(RECT)
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'offline', skippedDeckIndexes: [] })

    await renderItem(ctx, TARGET_ID)

    await waitFor(() =>
      expect(Object.values(ctx.get(onboardingTargetRectsAtom)[TARGET_ID] ?? {})).toEqual([RECT]),
    )
  })

  test('registers nothing without an onboardingTargetId', async () => {
    mockMeasureInWindow(RECT)
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'offline', skippedDeckIndexes: [] })

    await renderItem(ctx)

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })
})
