import { type ReactElement } from 'react'
import { usePlaylistClearMenu } from './usePlaylistClearMenu'
import { usePlaylistDeleteMenu } from './usePlaylistDeleteMenu'

/**
 * Composes the header menu's destructive playlist actions: clear and delete.
 * Both share the local non-favorite gate and each contributes its own
 * confirmation dialog, rendered together.
 * @param canManage - Whether the destructive items should be shown.
 * @param onCloseMenu - Closes the dropdown once an action is requested.
 * @returns Item gates/handlers and the combined dialogs element.
 */
export const usePlaylistManagementMenu = (canManage: boolean, onCloseMenu: () => void) => {
  const deleteMenu = usePlaylistDeleteMenu(canManage, onCloseMenu)
  const clearMenu = usePlaylistClearMenu(canManage, onCloseMenu)

  const renderDialogs = (): ReactElement => (
    <>
      {deleteMenu.renderDialog()}
      {clearMenu.renderDialog()}
    </>
  )

  return {
    canClear: clearMenu.canClear,
    canDelete: deleteMenu.canDelete,
    renderDialogs,
    requestClear: clearMenu.requestClear,
    requestDelete: deleteMenu.requestDelete,
  }
}
