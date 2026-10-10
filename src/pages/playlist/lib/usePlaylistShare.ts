import { useAction, useAtom } from '@reatom/npm-react'
import { validate as uuidValidate } from 'uuid'
import { FAVORITES_PLAYLIST, myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { showToast } from 'shared/model'
import { buildCustomPlaylistShareUrl } from './buildCustomPlaylistShareUrl'
import { buildPlaylistShareUrl } from './buildPlaylistShareUrl'
import { sharePlaylist } from './sharePlaylist'

const COPIED_MESSAGE = 'Ссылка скопирована'
const SHARE_ERROR_MESSAGE = 'Не удалось поделиться. Попробуйте ещё раз'

export const usePlaylistShare = (playlist: PlaylistData, onCloseMenu: () => void) => {
  const [localPlaylists] = useAtom(myPlaylistsAtom)
  const showToastAction = useAction(showToast)

  const localPlaylist = localPlaylists.find(item => item.id === playlist.id)
  const isServerPlaylist = uuidValidate(playlist.id)
  const isLocalPlaylist = localPlaylist !== undefined && playlist.id !== FAVORITES_PLAYLIST.id
  const canShare = isServerPlaylist || isLocalPlaylist

  const handleShare = async () => {
    if (!canShare) return
    const url = isLocalPlaylist
      ? buildCustomPlaylistShareUrl({
          sermonIds: localPlaylist?.sermonIds ?? [],
          title: playlist.title,
        })
      : buildPlaylistShareUrl(playlist.id)
    const result = await sharePlaylist({ text: `${playlist.title} — ${url}`, url })
    if (result === 'copied') showToastAction(COPIED_MESSAGE)
    if (result === 'error') showToastAction(SHARE_ERROR_MESSAGE)
    onCloseMenu()
  }

  return { canShare, handleShare }
}
