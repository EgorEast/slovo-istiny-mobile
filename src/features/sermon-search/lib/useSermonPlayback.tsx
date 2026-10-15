import { useAtom } from '@reatom/npm-react'
import { type ReactElement, type ReactNode, useCallback, useState } from 'react'
import { usePlayNewSermon } from 'entities/player'
import {
  FAVORITES_PLAYLIST,
  type LocalPlaylistData,
  myPlaylistsAtom,
  type PlaylistData,
} from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { SermonPlaylistPicker } from '../ui/SermonPlaylistPicker'
import { resolvePlaylist } from './resolvePlaylist'

interface PendingChoice {
  localPlaylists: PlaylistData[]
  sermon: SermonData
}

const toPlaylistData = (local: LocalPlaylistData): PlaylistData => ({
  artwork: null,
  id: local.id,
  sermons: local.sermons,
  title: local.title,
})

const containsSermon = (playlist: LocalPlaylistData, sermonId: string): boolean =>
  playlist.sermons.some(snapshot => snapshot.id === sermonId)

/**
 * Shared sermon-play chain for search results. When the tapped sermon belongs to
 * several playlists (server playlists plus local custom playlists such as
 * «Избранные»), a picker opens and playback waits for the choice; otherwise it
 * plays immediately. The built-in favorites playlist is the default context and
 * does not by itself make the choice ambiguous. Returns the modal element to
 * render on the screen, mirroring `useAddToPlaylistModal`, plus the picker's
 * dismiss handler so an owner (the onboarding tour) can close it.
 * @param root0 - Hook options.
 * @param root0.pickerWrapper - Page-owned wrapper around the picker dialog (baked
 * into the modal element so the tour can spotlight the picker window).
 */
export const useSermonPlayback = ({
  pickerWrapper,
}: {
  pickerWrapper?: (dialog: ReactElement) => ReactNode
} = {}) => {
  const playNewSermon = usePlayNewSermon()
  const [myPlaylists] = useAtom(myPlaylistsAtom)
  const [pending, setPending] = useState<null | PendingChoice>(null)

  const onSermonPress = useCallback(
    (sermon: SermonData) => {
      const serverPlaylists = sermon.playlists ?? []
      const localPlaylists = myPlaylists
        .filter(playlist => containsSermon(playlist, sermon.id))
        .map(toPlaylistData)
      const thresholdCount =
        serverPlaylists.length +
        localPlaylists.filter(playlist => playlist.id !== FAVORITES_PLAYLIST.id).length

      if (thresholdCount >= 2) {
        setPending({ localPlaylists, sermon })
        return
      }

      void playNewSermon({ playlist: localPlaylists[0] ?? resolvePlaylist(sermon), sermon })
    },
    [myPlaylists, playNewSermon],
  )

  const closePicker = useCallback(() => setPending(null), [])

  const onSelectPlaylist = useCallback(
    (playlist: PlaylistData) => {
      if (!pending) return

      setPending(null)
      void playNewSermon({ playlist, sermon: pending.sermon })
    },
    [pending, playNewSermon],
  )

  const modal = pending ? (
    <SermonPlaylistPicker
      visible
      onClose={closePicker}
      onSelect={onSelectPlaylist}
      containerWrapper={pickerWrapper}
      playlists={[...(pending.sermon.playlists ?? []), ...pending.localPlaylists]}
    />
  ) : null

  return { closePicker, modal, onSermonPress }
}
