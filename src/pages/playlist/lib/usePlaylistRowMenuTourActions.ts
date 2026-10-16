import { useCallback, useRef } from 'react'
import { useTourActionRegistrar } from 'features/onboarding'
import { type AudioPlayerData, type SermonData, toAudioPlayerData } from 'entities/sermon'
import { type TrackListMenuControls } from 'entities/track-list'

/**
 * Registers the playlist row menu's tour actions: the tour opens the first row's
 * menu and presses «Добавить в плейлист» itself (closing the menu and opening the
 * add-to-playlist modal), mirroring a real tap.
 * @param onAddToPlaylist - Opens the add-to-playlist modal for a sermon.
 * @param firstSermon - The first row's sermon whose menu the tour drives.
 * @returns A stable binder the first row uses to hand over its menu controls.
 */
export const usePlaylistRowMenuTourActions = (
  onAddToPlaylist: ((sermon: AudioPlayerData) => void) | undefined,
  firstSermon: SermonData | undefined,
) => {
  const controlsRef = useRef<null | TrackListMenuControls>(null)

  const bindRowMenu = useCallback((controls: TrackListMenuControls) => {
    controlsRef.current = controls
  }, [])

  const openRowMenu = useCallback(() => {
    controlsRef.current?.open()
  }, [])

  const pressRowMenuAdd = useCallback(() => {
    controlsRef.current?.close()
    const audio = toAudioPlayerData(firstSermon)
    if (audio !== null) onAddToPlaylist?.(audio)
  }, [firstSermon, onAddToPlaylist])

  useTourActionRegistrar('open-playlist-row-menu', openRowMenu)
  useTourActionRegistrar('press-row-menu-add', pressRowMenuAdd)

  return { bindRowMenu }
}
