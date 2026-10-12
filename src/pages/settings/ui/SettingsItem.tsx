import { Ionicons } from '@expo/vector-icons'
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { OnboardingTarget } from 'features/onboarding'
import { COLORS, FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { TouchableItem } from 'shared/ui/touchable-item'

export const SettingsItem = ({
  description,
  disabled,
  icon,
  onboardingTargetId,
  onPress,
  style,
  title,
}: {
  description?: string
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  onboardingTargetId?: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
  title: string
}) => {
  const { currentTheme } = useTheme()

  return (
    <OnboardingTarget id={onboardingTargetId}>
      <TouchableItem
        onPress={onPress}
        disabled={disabled}
        style={[styles.container, { backgroundColor: currentTheme.surface }, style]}
      >
        <View style={styles.content}>
          {icon ? (
            <Ionicons
              size={24}
              name={icon}
              style={styles.icon}
              color={disabled ? currentTheme.textMuted : currentTheme.text}
            />
          ) : null}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: disabled ? currentTheme.textMuted : currentTheme.text },
              ]}
            >
              {title}
            </Text>
            {description ? (
              <Text style={[styles.description, { color: currentTheme.textMuted }]}>
                {description}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableItem>
    </OnboardingTarget>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: COLORS.disabled,
    borderBottomWidth: 1,
    paddingHorizontal: INDENTS.high,
    paddingVertical: INDENTS.high,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  description: {
    fontSize: FONT_SIZES.sm,
    marginTop: INDENTS.low,
  },
  icon: {
    marginRight: INDENTS.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.base,
  },
})
