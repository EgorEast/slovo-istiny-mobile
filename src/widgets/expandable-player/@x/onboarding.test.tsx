import { renderHook } from '@testing-library/react-native'
import { registerTourAction, unregisterTourAction } from 'features/onboarding/@x/expandable-player'
import { usePlayerTourActions } from './onboarding'

jest.mock('features/onboarding/@x/expandable-player', () => ({
  registerTourAction: jest.fn(),
  unregisterTourAction: jest.fn(),
}))

const OPEN_MENU_ACTION_ID = 'open-player-menu'
const SHOW_DETAILS_ACTION_ID = 'show-player-details'

describe('usePlayerTourActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('registers the menu and details actions while mounted, then unregisters', async () => {
    const openMenu = jest.fn()
    const showDetails = jest.fn()

    const { unmount } = await renderHook(() => usePlayerTourActions({ openMenu, showDetails }))

    expect(registerTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID, openMenu)
    expect(registerTourAction).toHaveBeenCalledWith(SHOW_DETAILS_ACTION_ID, showDetails)

    await unmount()

    expect(unregisterTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID)
    expect(unregisterTourAction).toHaveBeenCalledWith(SHOW_DETAILS_ACTION_ID)
  })

  test('re-registers with the fresh handler when its identity changes', async () => {
    const firstOpenMenu = jest.fn()
    const secondOpenMenu = jest.fn()
    const showDetails = jest.fn()

    const { rerender } = await renderHook(
      ({ openMenu }: { openMenu: () => void }) => usePlayerTourActions({ openMenu, showDetails }),
      { initialProps: { openMenu: firstOpenMenu } },
    )

    await rerender({ openMenu: secondOpenMenu })

    expect(unregisterTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID)
    expect(registerTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID, secondOpenMenu)
  })
})
