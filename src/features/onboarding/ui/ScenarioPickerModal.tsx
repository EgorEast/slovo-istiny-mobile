import { useAction } from '@reatom/npm-react'
import { usePathname } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Modal } from 'shared/ui/modal'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { type OnboardingScenario, type ScenarioScope } from '../lib/scenarios'
import { useOnboardingScenarios } from '../lib/useOnboardingScenarios'
import { startOnboardingTour } from '../model'
import { ScenarioPickerGroup } from './ScenarioPickerGroup'

const TITLE = 'Что посмотреть?'
const SCREEN_GROUP_TITLE = 'На этом экране'
const GLOBAL_GROUP_TITLE = 'Глобальные'
const PLAYER_GROUP_TITLE = 'Плеер'
const SCROLL_TEST_ID = 'scenario-picker-scroll'

const isScenarioOnScreen = (scenario: OnboardingScenario, pathname: string) =>
  scenario.screens?.includes(pathname) ?? false

export const ScenarioPickerModal = ({
  onClose,
  scope = 'default',
  visible,
}: {
  onClose: () => void
  scope?: ScenarioScope
  visible: boolean
}) => {
  const { currentTheme } = useTheme()
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const scenarios = useOnboardingScenarios(scope)
  const defaultScenarios = useOnboardingScenarios('default')
  const startTour = useAction(startOnboardingTour)

  const handlePick = (scenario: OnboardingScenario) => {
    onClose()
    startTour(scenario.id)
  }

  const screenScenarios = scenarios.filter(scenario => isScenarioOnScreen(scenario, pathname))
  const globalScenarios = scenarios.filter(scenario => !isScenarioOnScreen(scenario, pathname))
  // The player picker is route-agnostic: its «Глобальные» group is every
  // route-less scenario (welcome/whatsNew), not the screen picker's leftovers.
  const playerGlobalScenarios = defaultScenarios.filter(scenario => scenario.screens === undefined)

  return (
    <Modal visible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <ScrollView
          testID={SCROLL_TEST_ID}
          contentContainerStyle={{ paddingBottom: insets.bottom + INDENTS.low }}
        >
          {scope === 'player' ? (
            <>
              <ScenarioPickerGroup
                onPick={handlePick}
                scenarios={scenarios}
                title={PLAYER_GROUP_TITLE}
              />
              <ScenarioPickerGroup
                onPick={handlePick}
                title={GLOBAL_GROUP_TITLE}
                scenarios={playerGlobalScenarios}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    // Bound the scroll area to the shared Modal's maxHeight: flexShrink lets the
    // column shrink to the contentContainer cap, so the ScrollView inside gets a
    // viewport shorter than its content and actually scrolls (otherwise the last
    // row is clipped by the contentContainer's `overflow: 'hidden'`).
    flexShrink: 1,
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
