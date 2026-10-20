import { MaterialCommunityIcons } from '@expo/vector-icons'
import { type ColorValue } from 'react-native'
import { resolveColor, useTheme } from 'shared/ui/theme'
import { PlaylistMenuRow } from './PlaylistMenuRow'

const ICON_SIZE = 18

export interface PlaylistOfflineMenuItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  iconColor?: ColorValue
  isDisabled?: boolean
  onboardingTargetId?: string
  onPress: () => void
  text: string
  textColor?: string
}

export const PlaylistOfflineMenuItem = ({
  icon,
  iconColor,
  isDisabled = false,
  onboardingTargetId,
  onPress,
  text,
  textColor,
}: PlaylistOfflineMenuItemProps) => {
  const { currentTheme } = useTheme()

  return (
    <PlaylistMenuRow
      text={text}
      onPress={onPress}
      textColor={textColor}
      isDisabled={isDisabled}
      onboardingTargetId={onboardingTargetId}
      icon={
        <MaterialCommunityIcons
          name={icon}
          size={ICON_SIZE}
          color={resolveColor(iconColor, isDisabled ? currentTheme.textMuted : currentTheme.icon)}
        />
      }
    />
  )
}
