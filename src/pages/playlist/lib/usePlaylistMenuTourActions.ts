import { useCallback } from 'react'
import { useTourActionRegistrar } from 'features/onboarding'

/**
 * Registers the playlist header menu's tour actions: the tour opens the dropdown
 * and later closes it (the final «Меню проповеди» step) instead of tapping the
 * live controls. Closing also shuts the share modal the tour opened, so the modal
 * never outlives the menu it was launched from.
 * @param openMenu - Opens the anchored dropdown at the button.
 * @param setMenuVisible - Dropdown visibility setter.
 * @param closeShareModal - Optional share-modal closer, folded into the close action.
 * @returns The stable close handler the menu's own controls use.
 */
export const usePlaylistMenuTourActions = (
  openMenu: () => void,
  setMenuVisible: (visible: boolean) => void,
  closeShareModal?: () => void,
) => {
  const closeMenu = useCallback(() => {
    setMenuVisible(false)
    closeShareModal?.()
  }, [setMenuVisible, closeShareModal])

  useTourActionRegistrar('open-playlist-menu', openMenu)
  useTourActionRegistrar('close-playlist-menu', closeMenu)

  return closeMenu
}
