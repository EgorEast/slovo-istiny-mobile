import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { ConfirmDialog } from 'shared/ui/confirm-dialog'
import { IconButton } from 'shared/ui/icon-button'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { ScenarioPickerModal } from './ScenarioPickerModal'

type HelpFlowStep = 'idle' | 'offer' | 'picker'

export const HelpHeaderButton = ({ tintColor }: { tintColor?: string }) => {
  const { currentTheme } = useTheme()
  const [step, setStep] = useState<HelpFlowStep>('idle')

  return (
    <>
      <IconButton
        hitSlop={INDENTS.low}
        onPress={() => setStep('offer')}
        accessibilityLabel='Онбординг и помощь'
        Icon={
          <Ionicons size={22} name='help-circle-outline' color={tintColor ?? currentTheme.text} />
        }
      />
      <ConfirmDialog
        cancelText='Закрыть'
        title='Обзор приложения'
        confirmText='Посмотреть'
        visible={step === 'offer'}
        onCancel={() => setStep('idle')}
        onConfirm={() => setStep('picker')}
        message='Хотите посмотреть, как пользоваться приложением?'
      />
      <ScenarioPickerModal visible={step === 'picker'} onClose={() => setStep('idle')} />
    </>
  )
}
