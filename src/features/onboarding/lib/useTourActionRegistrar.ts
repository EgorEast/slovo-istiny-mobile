import { useEffect } from 'react'
import { registerTourAction, unregisterTourAction } from './tourActions'

/**
 * Registers a tour action while the owning component is mounted, so an onboarding
 * action step can perform it. Re-registers when the id or handler identity changes
 * and unregisters on unmount; pass a stable handler (useCallback) to avoid churn.
 * @param id - Action id referenced by a step's `tapActionId`.
 * @param action - Handler the tour performs instead of the user.
 */
export const useTourActionRegistrar = (id: string, action: () => void) => {
  useEffect(() => {
    registerTourAction(id, action)

    return () => unregisterTourAction(id)
  }, [action, id])
}
