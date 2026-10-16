import { StyleSheet, Text } from 'react-native'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { type OnboardingScenario } from '../lib/scenarios'
import { ScenarioPickerRow } from './ScenarioPickerRow'

export const ScenarioPickerGroup = ({
  onPick,
  scenarios,
  title,
}: {
  onPick: (scenario: OnboardingScenario) => void
  scenarios: OnboardingScenario[]
  title: string
}) => {
  const { currentTheme } = useTheme()

  if (scenarios.length === 0) return null

  return (
    <>
      <Text style={[styles.header, { color: currentTheme.textMuted }]}>{title}</Text>
      {scenarios.map(scenario => (
        <ScenarioPickerRow key={scenario.id} scenario={scenario} onPress={() => onPick(scenario)} />
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    paddingBottom: INDENTS.lowest,
    paddingHorizontal: INDENTS.high,
    paddingTop: INDENTS.medium,
  },
})
