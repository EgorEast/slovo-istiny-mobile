import { MaterialCommunityIcons } from '@expo/vector-icons'
import { COLORS } from 'shared/ui/theme'
import { PlaylistMenuRow } from './PlaylistMenuRow'

const ICON_SIZE = 18
const CLEAR_ICON = 'playlist-remove'
const CLEAR_PLAYLIST_TEXT = 'Очистить плейлист'

/**
 * Destructive dropdown item that clears a local playlist of all sermons.
 * Rendered only for user-owned playlists; the color is the theme error tone.
 * @param root0 - Item props.
 * @param root0.onPress - Opens the clear confirmation.
 */
export const PlaylistClearMenuItem = ({ onPress }: { onPress: () => void }) => (
  <PlaylistMenuRow
    onPress={onPress}
    textColor={COLORS.error}
    text={CLEAR_PLAYLIST_TEXT}
    icon={<MaterialCommunityIcons size={ICON_SIZE} name={CLEAR_ICON} color={COLORS.error} />}
  />
)
