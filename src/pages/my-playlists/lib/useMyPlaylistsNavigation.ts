import { useRouter } from 'expo-router'
import { type LocalPlaylistData } from 'entities/playlist'
import { useNavigationGuard } from 'shared/routing'

/**
 * Row-tap navigation for the «Мои плейлисты» screen.
 *
 * Rows are guarded against a double-tap stacking two playlist screens. In edit
 * mode navigation is suppressed entirely: leaving would drop the uncommitted
 * local order.
 * @param isEditing - Whether the section edit mode is open.
 * @param favorites - The pinned favorites playlist, when present.
 * @returns Handlers for a playlist row and the favorites row.
 */
export const useMyPlaylistsNavigation = (isEditing: boolean, favorites?: LocalPlaylistData) => {
  const router = useRouter()
  const runGuarded = useNavigationGuard()

  // Принимает любую строку с id: и `LocalPlaylistData`, и `PlaylistListItemData`
  // из общего виджета списка структурно ей удовлетворяют.
  const onPressPlaylist = ({ id }: { id: string }) =>
    runGuarded(() => router.push({ params: { playlist: id }, pathname: '/listen/playlist' }))

  const onPressFavorites = () => {
    if (isEditing || !favorites) return

    onPressPlaylist(favorites)
  }

  return { onPressFavorites, onPressPlaylist }
}
