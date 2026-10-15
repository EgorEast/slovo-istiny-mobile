import { useAction } from '@reatom/npm-react'
import { usePathname } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Modal } from 'shared/ui/modal'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { type OnboardingScenario, type ScenarioScope } from '../lib/scenarios'
import { useOnboardingScenarios } from '../lib/useOnboardingScenarios'
import { startOnboardingTour } from '../model/tour'
import { ScenarioPickerGroup } from './ScenarioPickerGroup'

const TITLE = 'Что посмотреть?'
const SCREEN_GROUP_TITLE = 'На этом экране'
const GLOBAL_GROUP_TITLE = 'Глобальные'
const PLAYER_GROUP_TITLE = 'Плеер'
const SCROLL_TEST_ID = 'scenario-picker-scroll'

const isScenarioOnScreen = (scenario: OnboardingScenario, pathname: string) =>
  scenario.screens?.includes(pathname) ?? false

// A `globalFallback` scenario is local to its own screens but stays in «Глобальные»
// everywhere else — its lead-up starts on one of its screens (backup, share). A plain
// screen-bound scenario has no fallback and is hidden on foreign screens.
const isGlobalScenario = (scenario: OnboardingScenario, pathname: string) =>
  scenario.screens === undefined ||
  (scenario.globalFallback === true && !isScenarioOnScreen(scenario, pathname))

// The player picker is route-agnostic: it offers every route-less default scenario
// plus the `globalFallback` ones, whatever route sits beneath the fullscreen player.
const isPlayerGlobalScenario = (scenario: OnboardingScenario) =>
  scenario.screens === undefined || scenario.globalFallback === true

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
    startTour(scenario.id, pathname)
  }

  const screenScenarios = scenarios.filter(scenario => isScenarioOnScreen(scenario, pathname))
  // «Глобальные» = truly route-less scenarios (search, welcome/whatsNew) plus the
  // `globalFallback` ones (backup, share) on screens they do not name. A screen-bound
  // scenario without `globalFallback` is reachable only from its own screens and is not
  // offered here at all — otherwise its cards would show where its targets are absent.
  const globalScenarios = scenarios.filter(scenario => isGlobalScenario(scenario, pathname))
  const playerGlobalScenarios = defaultScenarios.filter(isPlayerGlobalScenario)

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
