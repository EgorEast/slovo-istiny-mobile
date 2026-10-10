import { MaterialCommunityIcons } from '@expo/vector-icons'
import { type RefObject } from 'react'
import { type ColorValue, View } from 'react-native'
import { IconButton } from 'shared/ui/icon-button'
import { useTheme } from 'shared/ui/theme'
import { headerMenuButtonStyles } from './styles'

const ICON_SIZE = 24

/**
 * The header menu trigger: a dots icon button anchored to its wrapper view.
 * @param props - Trigger configuration.
 * @param props.accessibilityLabel - Screen-reader name of the button.
 * @param props.buttonRef - Ref to the wrapper view used as the dropdown anchor.
 * @param props.iconColor - Icon tint; defaults to the theme text color.
 * @param props.onPress - Opens the menu.
 */
export const PlaylistHeaderMenuButton = ({
  accessibilityLabel,
  buttonRef,
  iconColor,
  onPress,
}: {
  accessibilityLabel: string
  buttonRef: RefObject<null | View>
  iconColor?: ColorValue
  onPress: () => void
}) => {
  const { currentTheme } = useTheme()

  return (
    <View ref={buttonRef} collapsable={false}>
      <IconButton
        onPress={onPress}
        style={headerMenuButtonStyles.button}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint='Нажмите чтобы открыть меню'
        Icon={
          <MaterialCommunityIcons
            size={ICON_SIZE}
            name='dots-vertical'
            color={iconColor ?? currentTheme.text}
          />
        }
      />
    </View>
  )
}
