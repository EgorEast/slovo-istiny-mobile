import Ionicons from '@expo/vector-icons/Ionicons'
import { useAction } from '@reatom/npm-react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Modal } from 'shared/ui/modal'
import { FONT_SIZES, INDENTS, RADIUSES, useTheme } from 'shared/ui/theme'
import { type OnboardingScenario } from '../lib/scenarios'
import { useOnboardingScenarios } from '../lib/useOnboardingScenarios'
import { startOnboardingTour } from '../model'

const TITLE = 'Что посмотреть?'
const ICON_SIZE = 22

export const ScenarioPickerModal = ({
  onClose,
  visible,
}: {
  onClose: () => void
  visible: boolean
}) => {
  const { currentTheme } = useTheme()
  const scenarios = useOnboardingScenarios()
  const startTour = useAction(startOnboardingTour)

  const handlePick = (scenario: OnboardingScenario) => {
    onClose()
    startTour(scenario.id)
  }

  return (
    <Modal visible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <ScrollView>
          {scenarios.map(scenario => (
            <Pressable
              key={scenario.id}
              style={styles.row}
              accessibilityRole='button'
              onPress={() => handlePick(scenario)}
              accessibilityLabel={`${scenario.title}. ${scenario.description}`}
            >
              <View style={[styles.iconCircle, { backgroundColor: currentTheme.background }]}>
                <Ionicons size={ICON_SIZE} name={scenario.icon} color={currentTheme.primary} />
              </View>
              <View style={styles.texts}>
                <Text style={[styles.rowTitle, { color: currentTheme.text }]}>
                  {scenario.title}
                </Text>
                <Text style={[styles.rowDescription, { color: currentTheme.textMuted }]}>
                  {scenario.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    paddingTop: INDENTS.medium,
  },
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    paddingBottom: INDENTS.medium,
    paddingHorizontal: INDENTS.high,
    paddingTop: INDENTS.low,
  },
})
