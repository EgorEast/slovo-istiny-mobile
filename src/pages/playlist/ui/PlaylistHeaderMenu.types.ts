import { type ColorValue } from 'react-native'
import { type PlaylistData } from 'entities/playlist'
import { type TrackToCache } from '../lib/PlaylistOfflineService'

export interface PlaylistHeaderMenuProps {
  /**
   * Screen-reader name of the trigger: callers that show a second menu button
   *  on the same screen (the player sheet) pass a contextual label.
   */
  accessibilityLabel?: string
  iconColor?: ColorValue
  /** Render the edit affordance for local playlists (playlist screen header only). */
  isEditEnabled?: boolean
  /**
   * Opens the batch add-to-playlist modal. Passed only by the playlist screen, so
   * the «Добавить все проповеди в плейлист» row appears there (and only when the
   * playlist has sermons) but never in the player sheet.
   */
  onAddAllToPlaylist?: (playlist: PlaylistData) => void
  /** Optional onboarding target id for the menu trigger (playlist screen header only). */
  onboardingTargetId?: string
  playlist: PlaylistData
  playlistTitle: string
  tracksData: TrackToCache[]
}
