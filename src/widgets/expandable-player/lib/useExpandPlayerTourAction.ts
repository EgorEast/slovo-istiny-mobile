import { useCallback } from 'react'
import { useTourActionRegistrar } from 'features/onboarding'

const EXPAND_PLAYER_ACTION_ID = 'expand-player'

// Registers the mini-player's expand handler as an onboarding tour action while the
// player widget is mounted, so the player tour can expand it to fullscreen itself.
// The fullscreen menu actions (usePlayerTourActions) only mount once expanded, so the
// collapsed-state action lives here. A stable callback avoids re-registration churn;
// widgets import the onboarding registry through its public barrel (legal downward).
export const useExpandPlayerTourAction = ({
  expand,
  hasAudio,
}: {
  expand: () => void
  hasAudio: boolean
}) => {
  const runExpand = useCallback(() => {
    if (hasAudio) expand()
  }, [expand, hasAudio])

  useTourActionRegistrar(EXPAND_PLAYER_ACTION_ID, runExpand)
}
