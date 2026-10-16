import { useEffect } from 'react'
import { registerTourAction, unregisterTourAction } from 'features/onboarding'

const OPEN_MENU_ACTION_ID = 'open-player-menu'
const SHOW_DETAILS_ACTION_ID = 'show-player-details'
const OPEN_SPEED_MENU_ACTION_ID = 'open-player-speed-menu'
const OPEN_SOUND_SETTINGS_ACTION_ID = 'open-player-sound-settings'

// Registers the fullscreen player's menu handlers as onboarding tour actions while
// it is mounted, so an action step can perform them instead of the user: open the
// menu, show «Подробнее», switch the menu to its speed page, open the sound sheet.
// The handlers must be stable (useCallback) so the registration does not churn on
// every render. Widgets import the onboarding registry through its public barrel —
// the downward widgets → features dependency is legal.
export const usePlayerTourActions = ({
  openMenu,
  openSoundSettings,
  openSpeedMenu,
  showDetails,
}: {
  openMenu: () => void
  openSoundSettings: () => void
  openSpeedMenu: () => void
  showDetails: () => void
}) => {
  useEffect(() => {
    registerTourAction(OPEN_MENU_ACTION_ID, openMenu)
    registerTourAction(SHOW_DETAILS_ACTION_ID, showDetails)
    registerTourAction(OPEN_SPEED_MENU_ACTION_ID, openSpeedMenu)
    registerTourAction(OPEN_SOUND_SETTINGS_ACTION_ID, openSoundSettings)

    return () => {
      unregisterTourAction(OPEN_MENU_ACTION_ID)
      unregisterTourAction(SHOW_DETAILS_ACTION_ID)
      unregisterTourAction(OPEN_SPEED_MENU_ACTION_ID)
      unregisterTourAction(OPEN_SOUND_SETTINGS_ACTION_ID)
    }
  }, [openMenu, openSoundSettings, openSpeedMenu, showDetails])
}
