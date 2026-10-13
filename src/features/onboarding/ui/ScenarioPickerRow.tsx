import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FONT_SIZES, INDENTS, RADIUSES, useTheme } from 'shared/ui/theme'
import { type OnboardingScenario } from '../lib/scenarios'

const ICON_SIZE = 22

export const ScenarioPickerRow = ({
  onPress,
  scenario,
}: {
  onPress: () => void
  scenario: OnboardingScenario
}) => {
  const { currentTheme } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole='button'
      accessibilityLabel={`${scenario.title}. ${scenario.description}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: currentTheme.background }]}>
        <Ionicons size={ICON_SIZE} name={scenario.icon} color={currentTheme.primary} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.rowTitle, { color: currentTheme.text }]}>{scenario.title}</Text>
        <Text style={[styles.rowDescription, { color: currentTheme.textMuted }]}>
          {scenario.description}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  iconCircle: {
    alignItems: 'center',
    borderRadius: RADIUSES.round,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: INDENTS.medium,
    paddingHorizontal: INDENTS.high,
    paddingVertical: INDENTS.middle,
  },
  rowDescription: {
    fontSize: FONT_SIZES.sm,
    marginTop: INDENTS.lowest,
  },
  rowTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
  texts: {
    flex: 1,
  },
})
