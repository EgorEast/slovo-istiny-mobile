import Ionicons from '@expo/vector-icons/Ionicons'
import { useAtom } from '@reatom/npm-react'
import { useState } from 'react'
import { type ColorValue } from 'react-native'
import { toursDisabledAtom } from 'shared/model'
import { IconButton } from 'shared/ui/icon-button'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { type ScenarioScope } from '../lib/scenarios'
import { OnboardingTarget } from './OnboardingTarget'
import { ScenarioPickerModal } from './ScenarioPickerModal'

// A fixed, app-wide target id: every «?» instance registers it while a tour is
// active, but instances on hidden screens measure zero-size and are rejected by
// the measurement guard, so only the active screen's button holds the rect.
const HELP_TARGET_ID = 'app.help-button'

export const HelpHeaderButton = ({
  scope,
  tintColor,
}: {
  scope?: ScenarioScope
  tintColor?: ColorValue
}) => {
  const { currentTheme } = useTheme()
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [toursDisabled] = useAtom(toursDisabledAtom)

  if (toursDisabled) return null

  return (
    <>
      <OnboardingTarget id={HELP_TARGET_ID}>
        <IconButton
          hitSlop={INDENTS.low}
          onPress={() => setPickerOpen(true)}
          accessibilityLabel='Онбординг и помощь'
          Icon={
            <Ionicons size={22} name='help-circle-outline' color={tintColor ?? currentTheme.text} />
          }
        />
      </OnboardingTarget>
      <ScenarioPickerModal
        scope={scope}
        visible={isPickerOpen}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}
