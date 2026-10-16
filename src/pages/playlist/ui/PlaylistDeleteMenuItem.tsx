import { Ionicons } from '@expo/vector-icons'
import { COLORS } from 'shared/ui/theme'
import { PlaylistMenuRow } from './PlaylistMenuRow'

const ICON_SIZE = 18
const DELETE_ICON = 'trash-outline'

const DELETE_PLAYLIST_TEXT = 'Удалить плейлист'

/**
 * Destructive dropdown item that deletes a local playlist. Rendered only for
 * user-owned playlists; the color is the theme error tone.
 * @param root0 - Item props.
 * @param root0.onboardingTargetId - Optional onboarding target id.
 * @param root0.onPress - Opens the delete confirmation.
 */
export const PlaylistDeleteMenuItem = ({
  onboardingTargetId,
  onPress,
}: {
  onboardingTargetId?: string
  onPress: () => void
}) => (
  <PlaylistMenuRow
    onPress={onPress}
    textColor={COLORS.error}
    text={DELETE_PLAYLIST_TEXT}
    onboardingTargetId={onboardingTargetId}
    icon={<Ionicons size={ICON_SIZE} name={DELETE_ICON} color={COLORS.error} />}
  />
)
