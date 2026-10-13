import { useCallback } from 'react'
import { usePlayerTourActions } from '../../lib/usePlayerTourActions'

// Wires the fullscreen player's menu handlers into the onboarding tour-action
// registry. Each handler mirrors the real menu-item tap: opening the menu, showing
// details, switching the menu to its speed page, or opening the sound sheet (which
// closes the menu first) — so the tour can perform the step instead of the user.
export const useFullscreenTourActions = ({
  setMenuView,
  setShowDetails,
  setShowMenu,
  setShowSoundSettings,
}: {
  setMenuView: (view: 'main' | 'speed') => void
  setShowDetails: (show: boolean) => void
  setShowMenu: (show: boolean) => void
  setShowSoundSettings: (show: boolean) => void
}) => {
  const openMenu = useCallback(() => setShowMenu(true), [setShowMenu])
  const showDetails = useCallback(() => {
    setShowDetails(true)
    setShowMenu(false)
  }, [setShowDetails, setShowMenu])
  const openSpeedMenu = useCallback(() => {
    setMenuView('speed')
    setShowMenu(true)
  }, [setMenuView, setShowMenu])
  const openSoundSettings = useCallback(() => {
    setShowSoundSettings(true)
    setShowMenu(false)
  }, [setShowMenu, setShowSoundSettings])

  usePlayerTourActions({ openMenu, openSoundSettings, openSpeedMenu, showDetails })
}
