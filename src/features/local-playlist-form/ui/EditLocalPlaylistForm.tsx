import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Text, View } from 'react-native'
import { FormField, FormSubmitContext } from 'shared/ui/form'
import { PressableButton } from 'shared/ui/pressable-button'
import { COLORS, useTheme } from 'shared/ui/theme'
import { useEditLocalPlaylistForm } from '../lib/useEditLocalPlaylistForm'
import { useLocalPlaylistDelete } from '../lib/useLocalPlaylistDelete'
import { LocalPlaylistDeleteDialog } from './LocalPlaylistDeleteDialog'
import { playlistFormStyles as styles } from './playlistFormStyles'

const TITLE = 'Редактировать плейлист'
const NAME_LABEL = 'Название'
const SAVE_LABEL = 'Сохранить'
const DELETE_LABEL = 'Удалить'
const DELETE_ICON = 'trash-outline'
const DELETE_ICON_SIZE = 20

// Тело формы редактирования локального плейлиста: переименование («Сохранить»)
// и удаление с подтверждением (`LocalPlaylistDeleteDialog`). «Сохранить» доступна,
// только когда обрезанное название непустое и отличается от исходного. Enter в
// поле названия отправляет форму — `FormSubmitContext` включает в `FormField`
// `returnKeyType`/`onSubmitEditing` на тот же `save`, что и кнопка.
export const EditLocalPlaylistForm = ({
  currentTitle,
  onClose,
  playlistId,
}: {
  currentTitle: string
  onClose: () => void
  playlistId: string
}) => {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const { canSave, save, setTitle, title } = useEditLocalPlaylistForm(
    playlistId,
    currentTitle,
    onClose,
  )

  const handleDeleted = useCallback(() => {
    onClose()
    router.back()
  }, [onClose, router])
  const { cancelDelete, confirmDelete, isDeleteOpen, requestDelete } =
    useLocalPlaylistDelete(handleDeleted)

  return (
    <FormSubmitContext.Provider value={() => void save()}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <View style={styles.field}>
          <FormField value={title} label={NAME_LABEL} onChangeText={setTitle} />
        </View>
        <PressableButton
          style={styles.delete}
          accessibilityLabel={DELETE_LABEL}
          onPress={() => requestDelete(playlistId)}
        >
          <Ionicons name={DELETE_ICON} color={COLORS.error} size={DELETE_ICON_SIZE} />
          <Text style={[styles.deleteText, { color: COLORS.error }]}>{DELETE_LABEL}</Text>
        </PressableButton>
        <PressableButton
          disabled={!canSave}
          onPress={() => void save()}
          style={[
            styles.submit,
            { borderTopColor: currentTheme.skeleton },
            !canSave && styles.submitDisabled,
          ]}
        >
          <Text style={[styles.submitText, { color: currentTheme.primary }]}>{SAVE_LABEL}</Text>
        </PressableButton>

        <LocalPlaylistDeleteDialog
          visible={isDeleteOpen}
          onCancel={cancelDelete}
          onConfirm={() => void confirmDelete()}
        />
      </View>
    </FormSubmitContext.Provider>
  )
}
