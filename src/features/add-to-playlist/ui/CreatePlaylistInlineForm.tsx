import { StyleSheet, Text, View } from 'react-native'
import { useCreateLocalPlaylist } from 'entities/playlist'
import { FormField, FormSubmitContext } from 'shared/ui/form'
import { PressableButton } from 'shared/ui/pressable-button'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'

const NAME_LABEL = 'Название'
const NAME_PLACEHOLDER = 'Например: Проповеди недели'
const CANCEL_LABEL = 'Отмена'
const CREATE_LABEL = 'Создать'

/**
 * Встроенная форма создания плейлиста внутри модалки «Добавить в плейлист».
 *
 * После создания плейлист попадает в `myPlaylistsAtom`, поэтому список модалки
 * обновляется сам; форма лишь сообщает вызывающему об окончании
 * (`onFinished`) — навигации здесь нет. Enter в поле названия отправляет форму
 * через `FormSubmitContext`, «Отмена» просто возвращает к списку и не трогает
 * черновик выбора.
 * @param root0 - Пропсы формы.
 * @param root0.onFinished - Вернуться к списку плейлистов (после создания или отмены).
 */
export const CreatePlaylistInlineForm = ({ onFinished }: { onFinished: () => void }) => {
  const { currentTheme } = useTheme()
  const { canSubmit, setTitle, submit, submitting, title } = useCreateLocalPlaylist(onFinished)
  const isDisabled = !canSubmit || submitting

  return (
    <FormSubmitContext.Provider value={() => void submit()}>
      <View style={styles.container}>
        <View style={styles.field}>
          <FormField
            value={title}
            label={NAME_LABEL}
            onChangeText={setTitle}
            placeholder={NAME_PLACEHOLDER}
          />
        </View>
        <View style={[styles.actions, { borderTopColor: currentTheme.skeleton }]}>
          <PressableButton onPress={onFinished} style={styles.button}>
            <Text style={[styles.label, { color: currentTheme.text }]}>{CANCEL_LABEL}</Text>
          </PressableButton>
          <PressableButton
            disabled={isDisabled}
            style={styles.button}
            onPress={() => void submit()}
          >
            <Text
              style={[
                styles.label,
                { color: isDisabled ? currentTheme.textMuted : currentTheme.primary },
              ]}
            >
              {CREATE_LABEL}
            </Text>
          </PressableButton>
        </View>
      </View>
    </FormSubmitContext.Provider>
  )
}

const styles = StyleSheet.create({
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  button: {
    alignItems: 'center',
    flex: 1,
    padding: INDENTS.medium,
  },
  container: {
    paddingTop: INDENTS.low,
  },
  field: {
    paddingHorizontal: INDENTS.high,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
})
