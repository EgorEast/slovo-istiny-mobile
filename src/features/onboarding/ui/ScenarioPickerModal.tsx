import { useAction } from '@reatom/npm-react'
import { usePathname } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Modal } from 'shared/ui/modal'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { type OnboardingScenario } from '../lib/scenarios'
import { useOnboardingScenarios } from '../lib/useOnboardingScenarios'
import { startOnboardingTour } from '../model'
import { ScenarioPickerGroup } from './ScenarioPickerGroup'

const TITLE = 'Что посмотреть?'
const SCREEN_GROUP_TITLE = 'На этом экране'
const GLOBAL_GROUP_TITLE = 'Глобальные'

const isScenarioOnScreen = (scenario: OnboardingScenario, pathname: string) =>
  scenario.screens?.includes(pathname) ?? false

export const ScenarioPickerModal = ({
  onClose,
  visible,
}: {
  onClose: () => void
  visible: boolean
}) => {
  const { currentTheme } = useTheme()
  const pathname = usePathname()
  const scenarios = useOnboardingScenarios()
  const startTour = useAction(startOnboardingTour)

  const handlePick = (scenario: OnboardingScenario) => {
    onClose()
    startTour(scenario.id)
  }

  const screenScenarios = scenarios.filter(scenario => isScenarioOnScreen(scenario, pathname))
  const globalScenarios = scenarios.filter(scenario => !isScenarioOnScreen(scenario, pathname))

  return (
    <Modal visible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <ScrollView>
          <ScenarioPickerGroup
            onPick={handlePick}
            title={SCREEN_GROUP_TITLE}
            scenarios={screenScenarios}
          />
          <ScenarioPickerGroup
            onPick={handlePick}
            title={GLOBAL_GROUP_TITLE}
            scenarios={globalScenarios}
          />
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    paddingBottom: INDENTS.medium,
    paddingHorizontal: INDENTS.high,
    paddingTop: INDENTS.low,
  },
})
