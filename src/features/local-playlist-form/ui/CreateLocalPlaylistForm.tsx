import { Text, View } from 'react-native'
import { FormField, FormSubmitContext } from 'shared/ui/form'
import { PressableButton } from 'shared/ui/pressable-button'
import { useTheme } from 'shared/ui/theme'
import { useCreateLocalPlaylistForm } from '../lib/useCreateLocalPlaylistForm'
import { playlistFormStyles as styles } from './playlistFormStyles'

const TITLE = 'Новый плейлист'
const NAME_LABEL = 'Название'
const NAME_PLACEHOLDER = 'Например: Проповеди недели'
const SUBMIT_LABEL = 'Создать'

// Тело формы создания локального плейлиста: поле названия и «Создать».
// «Создать» недоступна, пока название пустое/пробельное. Enter в поле названия
// отправляет форму — `FormSubmitContext` включает в `FormField` `returnKeyType`
// и `onSubmitEditing`, ведущие на тот же `submit`, что и кнопка.
export const CreateLocalPlaylistForm = ({ onClose }: { onClose: () => void }) => {
  const { currentTheme } = useTheme()
  const { canSubmit, setTitle, submit, title } = useCreateLocalPlaylistForm(onClose)

  return (
    <FormSubmitContext.Provider value={() => void submit()}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <View style={styles.field}>
          <FormField
            value={title}
            label={NAME_LABEL}
            onChangeText={setTitle}
            placeholder={NAME_PLACEHOLDER}
          />
        </View>
        <PressableButton
          disabled={!canSubmit}
          onPress={() => void submit()}
          style={[
            styles.submit,
            { borderTopColor: currentTheme.skeleton },
            !canSubmit && styles.submitDisabled,
          ]}
        >
          <Text style={[styles.submitText, { color: currentTheme.primary }]}>{SUBMIT_LABEL}</Text>
        </PressableButton>
      </View>
    </FormSubmitContext.Provider>
  )
}
