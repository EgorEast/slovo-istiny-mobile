import { useCallback } from 'react'
import { usePlayerTourActions } from '../../@x/onboarding'

// Wires the fullscreen player's menu/details handlers into the onboarding tour-action
// registry. A real menu-item tap shows details and closes the menu — the tour's
// "Подробнее" action mirrors that, so the details overlay is not hidden behind the menu.
export const useFullscreenTourActions = ({
  setShowDetails,
  setShowMenu,
}: {
  setShowDetails: (show: boolean) => void
  setShowMenu: (show: boolean) => void
}) => {
  const openMenu = useCallback(() => setShowMenu(true), [setShowMenu])
  const showDetails = useCallback(() => {
    setShowDetails(true)
    setShowMenu(false)
  }, [setShowDetails, setShowMenu])

  usePlayerTourActions({ openMenu, showDetails })
}
