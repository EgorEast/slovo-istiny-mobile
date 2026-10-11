import { useAtom } from '@reatom/npm-react'
import { useRouter } from 'expo-router'
import { authUserAtom, canAccessAdmin } from 'entities/auth'
import { FAVORITES_PLAYLIST, myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { buildPublishSermonsParam } from './buildPublishSermonsParam'

const CREATE_PLAYLIST_ROUTE = '/admin/playlists/create'

/**
 * Opens the admin playlist form pre-filled from a local playlist.
 *
 * Only user-owned local playlists can be published (favorites excluded), and the
 * publish affordance is admin-only: `canPublish` also requires an admin/moderator
 * session, so regular users never see a dead-end login item. The handler
 * navigates to the create form with the title, sermon ids and sermon snapshots
 * (so the picker renders the already-selected rows) as params.
 * @param playlist - Playlist shown on the screen.
 * @param onCloseMenu - Closes the header menu after navigating.
 * @returns Whether the playlist is editable/publishable and the publish handler.
 */
export const useLocalPlaylistPublish = (playlist: PlaylistData, onCloseMenu: () => void) => {
  const router = useRouter()
  const [localPlaylists] = useAtom(myPlaylistsAtom)
  const [authUser] = useAtom(authUserAtom)

  const localPlaylist = localPlaylists.find(item => item.id === playlist.id)
  const isLocalPlaylist = localPlaylist !== undefined && playlist.id !== FAVORITES_PLAYLIST.id
  const canPublish = isLocalPlaylist && canAccessAdmin(authUser)

  const handlePublish = () => {
    if (!localPlaylist) return
    router.push({
      params: {
        sermonIds: localPlaylist.sermonIds.join(','),
        sermons: buildPublishSermonsParam(localPlaylist),
        title: localPlaylist.title,
      },
      pathname: CREATE_PLAYLIST_ROUTE,
    })
    onCloseMenu()
  }

  return { canPublish, handlePublish, isLocalPlaylist }
}
