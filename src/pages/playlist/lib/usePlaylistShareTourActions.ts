import { useTourActionRegistrar } from 'features/onboarding'

/**
 * Registers the playlist share modal's tour action: the tour opens the share window
 * itself (after closing the header menu) instead of tapping the «Поделиться» row.
 * The modal's close stays with the menu's close action — it already shuts it.
 * @param openShareModal - Opens the share modal for the current playlist.
 */
export const usePlaylistShareTourActions = (openShareModal: () => void) => {
  useTourActionRegistrar('open-playlist-share', openShareModal)
}
