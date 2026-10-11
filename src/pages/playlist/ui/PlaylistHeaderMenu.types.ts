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
  playlist: PlaylistData
  playlistTitle: string
  tracksData: TrackToCache[]
}
