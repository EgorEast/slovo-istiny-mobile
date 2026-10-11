import { useRouter } from 'expo-router'
import { type PlaylistData } from 'entities/playlist'
import { useNavigationGuard } from 'shared/routing'

export const useListenNavigation = () => {
  const router = useRouter()
  const runGuarded = useNavigationGuard()

  const navigateToPlaylist = (playlist: PlaylistData) => {
    runGuarded(() => {
      router.push({
        params: { playlist: playlist.id },
        pathname: '/listen/playlist',
      })
    })
  }

  const navigateToPlaylistList = (sectionId: string) => {
    runGuarded(() => {
      router.push({
        params: { sectionId },
        pathname: '/listen/playlist-list',
      })
    })
  }

  const navigateToMyPlaylists = () => {
    runGuarded(() => {
      router.push({ pathname: '/listen/my-playlists' })
    })
  }

  return {
    navigateToMyPlaylists,
    navigateToPlaylist,
    navigateToPlaylistList,
  }
}
