import Ionicons from '@expo/vector-icons/Ionicons'
import { useAtom } from '@reatom/npm-react'
import { useState } from 'react'
import { toursDisabledAtom } from 'shared/model'
import { IconButton } from 'shared/ui/icon-button'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { ScenarioPickerModal } from './ScenarioPickerModal'

export const HelpHeaderButton = ({ tintColor }: { tintColor?: string }) => {
  const { currentTheme } = useTheme()
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [toursDisabled] = useAtom(toursDisabledAtom)

  if (toursDisabled) return null

  return (
    <>
      <IconButton
        hitSlop={INDENTS.low}
        onPress={() => setPickerOpen(true)}
        accessibilityLabel='Онбординг и помощь'
        Icon={
          <Ionicons size={22} name='help-circle-outline' color={tintColor ?? currentTheme.text} />
        }
      />
      <ScenarioPickerModal visible={isPickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  )
}
