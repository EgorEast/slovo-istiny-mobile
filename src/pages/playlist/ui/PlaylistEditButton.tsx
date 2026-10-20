import { Ionicons } from '@expo/vector-icons'
import { type ColorValue } from 'react-native'
import { IconButton } from 'shared/ui/icon-button'
import { resolveColor, useTheme } from 'shared/ui/theme'
import { headerMenuButtonStyles } from './styles'

const ICON_SIZE = 24
const EDIT_ICON = 'create-outline'
const EDIT_LABEL = 'Редактировать плейлист'

/**
 * Header edit trigger for a local (user-owned) playlist. Sits next to the menu
 * button and is rendered only for editable playlists.
 * @param props - Trigger configuration.
 * @param props.iconColor - Icon tint; defaults to the theme text color.
 * @param props.onPress - Opens the edit form.
 */
export const PlaylistEditButton = ({
  iconColor,
  onPress,
}: {
  iconColor?: ColorValue
  onPress: () => void
}) => {
  const { currentTheme } = useTheme()

  return (
    <IconButton
      onPress={onPress}
      accessibilityLabel={EDIT_LABEL}
      style={headerMenuButtonStyles.button}
      Icon={
        <Ionicons
          size={ICON_SIZE}
          name={EDIT_ICON}
          color={resolveColor(iconColor, currentTheme.text)}
        />
      }
    />
  )
}
