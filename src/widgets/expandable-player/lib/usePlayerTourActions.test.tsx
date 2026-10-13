import { renderHook } from '@testing-library/react-native'
import { registerTourAction, unregisterTourAction } from 'features/onboarding'
import { usePlayerTourActions } from './usePlayerTourActions'

jest.mock('features/onboarding', () => ({
  registerTourAction: jest.fn(),
  unregisterTourAction: jest.fn(),
}))

const OPEN_MENU_ACTION_ID = 'open-player-menu'
const SHOW_DETAILS_ACTION_ID = 'show-player-details'
const OPEN_SPEED_MENU_ACTION_ID = 'open-player-speed-menu'
const OPEN_SOUND_SETTINGS_ACTION_ID = 'open-player-sound-settings'

const buildHandlers = () => ({
  openMenu: jest.fn(),
  openSoundSettings: jest.fn(),
  openSpeedMenu: jest.fn(),
  showDetails: jest.fn(),
})

describe('usePlayerTourActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('registers the menu, details, speed and sound actions while mounted, then unregisters', async () => {
    const handlers = buildHandlers()

    const { unmount } = await renderHook(() => usePlayerTourActions(handlers))

    expect(registerTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID, handlers.openMenu)
    expect(registerTourAction).toHaveBeenCalledWith(SHOW_DETAILS_ACTION_ID, handlers.showDetails)
    expect(registerTourAction).toHaveBeenCalledWith(
      OPEN_SPEED_MENU_ACTION_ID,
      handlers.openSpeedMenu,
    )
    expect(registerTourAction).toHaveBeenCalledWith(
      OPEN_SOUND_SETTINGS_ACTION_ID,
      handlers.openSoundSettings,
    )

    await unmount()

    expect(unregisterTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID)
    expect(unregisterTourAction).toHaveBeenCalledWith(SHOW_DETAILS_ACTION_ID)
    expect(unregisterTourAction).toHaveBeenCalledWith(OPEN_SPEED_MENU_ACTION_ID)
    expect(unregisterTourAction).toHaveBeenCalledWith(OPEN_SOUND_SETTINGS_ACTION_ID)
  })

  test('re-registers with the fresh handler when its identity changes', async () => {
    const firstOpenMenu = jest.fn()
    const secondOpenMenu = jest.fn()
    const rest = buildHandlers()

    const { rerender } = await renderHook(
      ({ openMenu }: { openMenu: () => void }) => usePlayerTourActions({ ...rest, openMenu }),
      { initialProps: { openMenu: firstOpenMenu } },
    )

    await rerender({ openMenu: secondOpenMenu })

    expect(unregisterTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID)
    expect(registerTourAction).toHaveBeenCalledWith(OPEN_MENU_ACTION_ID, secondOpenMenu)
  })
})
