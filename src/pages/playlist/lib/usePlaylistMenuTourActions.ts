import { useCallback } from 'react'
import { useTourActionRegistrar } from 'features/onboarding'

/**
 * Registers the playlist header menu's tour actions: the tour opens the dropdown
 * and later closes it (the final «Меню проповеди» step) instead of tapping the
 * live controls.
 * @param openMenu - Opens the anchored dropdown at the button.
 * @param setMenuVisible - Dropdown visibility setter.
 * @returns The stable close handler the menu's own controls use.
 */
export const usePlaylistMenuTourActions = (
  openMenu: () => void,
  setMenuVisible: (visible: boolean) => void,
) => {
  const closeMenu = useCallback(() => setMenuVisible(false), [setMenuVisible])

  useTourActionRegistrar('open-playlist-menu', openMenu)
  useTourActionRegistrar('close-playlist-menu', closeMenu)

  return closeMenu
}
