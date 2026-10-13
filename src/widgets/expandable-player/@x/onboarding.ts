// Кросс-импорт по конвенции FSD `@x`: полноэкранный плеер отдаёт онбордингу действия
// «открыть меню» и «показать Подробнее» через реестр tour-действий, пока смонтирован.
// Онбординг импортируется через его @x-точку, а не через barrel.
import { useEffect } from 'react'
import { registerTourAction, unregisterTourAction } from 'features/onboarding/@x/expandable-player'

const OPEN_MENU_ACTION_ID = 'open-player-menu'
const SHOW_DETAILS_ACTION_ID = 'show-player-details'

// Registers the fullscreen player's menu/details handlers as tour actions while it is
// mounted, so an onboarding action step can perform them itself. The handlers must be
// stable (useCallback) so the registration does not churn on every render.
export const usePlayerTourActions = ({
  openMenu,
  showDetails,
}: {
  openMenu: () => void
  showDetails: () => void
}) => {
  useEffect(() => {
    registerTourAction(OPEN_MENU_ACTION_ID, openMenu)
    registerTourAction(SHOW_DETAILS_ACTION_ID, showDetails)

    return () => {
      unregisterTourAction(OPEN_MENU_ACTION_ID)
      unregisterTourAction(SHOW_DETAILS_ACTION_ID)
    }
  }, [openMenu, showDetails])
}
