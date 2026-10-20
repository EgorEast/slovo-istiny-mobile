import Ionicons from '@expo/vector-icons/Ionicons'
import { useAtom } from '@reatom/npm-react'
import { useState } from 'react'
import { type ColorValue } from 'react-native'
import { toursDisabledAtom } from 'shared/model'
import { IconButton } from 'shared/ui/icon-button'
import { INDENTS, resolveColor, useTheme } from 'shared/ui/theme'
import { type ScenarioScope } from '../lib/scenarios'
import { OnboardingTarget } from './OnboardingTarget'
import { ScenarioPickerModal } from './ScenarioPickerModal'

// A fixed, app-wide target id: every «?» instance registers its own rect while a
// tour is active (the registry is keyed per instance), and the spotlight picks the
// on-screen instance's rect — so a hidden screen's button cannot clobber it.
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
            <Ionicons
              size={22}
              name='help-circle-outline'
              color={resolveColor(tintColor, currentTheme.text)}
            />
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
