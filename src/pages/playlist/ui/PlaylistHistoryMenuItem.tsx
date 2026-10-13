import { Ionicons } from '@expo/vector-icons'
import { useTheme } from 'shared/ui/theme'
import { PlaylistMenuRow } from './PlaylistMenuRow'

const ICON_SIZE = 18

export interface PlaylistHistoryMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap
  onboardingTargetId?: string
  onPress: () => void
  text: string
}

export const PlaylistHistoryMenuItem = ({
  icon,
  onboardingTargetId,
  onPress,
  text,
}: PlaylistHistoryMenuItemProps) => {
  const { currentTheme } = useTheme()

  return (
    <PlaylistMenuRow
      text={text}
      onPress={onPress}
      onboardingTargetId={onboardingTargetId}
      icon={<Ionicons name={icon} size={ICON_SIZE} color={currentTheme.icon} />}
    />
  )
}
