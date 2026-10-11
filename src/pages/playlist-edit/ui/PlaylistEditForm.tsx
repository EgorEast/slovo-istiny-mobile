import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Text, View } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { LocalPlaylistDeleteDialog, useLocalPlaylistDelete } from 'features/local-playlist-form'
import { type LocalPlaylistData } from 'entities/playlist'
import { type SermonShape } from 'shared/model'
import { EmptyState } from 'shared/ui'
import { FormField, FormSubmitContext } from 'shared/ui/form'
import { PressableButton } from 'shared/ui/pressable-button'
import { COLORS, useTheme } from 'shared/ui/theme'
import { usePlaylistEditForm } from '../lib/usePlaylistEditForm'
import { usePlaylistEditHeader } from '../lib/usePlaylistEditHeader'
import { styles } from './styles'
import { usePlaylistEditItemRenderer } from './usePlaylistEditItemRenderer'

const NAME_LABEL = 'Название'
const SAVE_LABEL = 'Сохранить'
const DELETE_LABEL = 'Удалить плейлист'
const DELETE_ICON = 'trash-outline'
const DELETE_ICON_SIZE = 20
const EMPTY_MESSAGE = 'В плейлисте пока нет проповедей'

const countTitle = (count: number) => `Проповеди (${count})`

// Тело экрана редактирования локального плейлиста: переименование (Enter в поле
// названия отправляет ту же `save`, что и «Сохранить») и drag-список проповедей
// только для перестановки — добавления/удаления проповедей здесь нет. Удаление
// плейлиста с подтверждением живёт в футере списка.
export const PlaylistEditForm = ({ playlist }: { playlist: LocalPlaylistData }) => {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const { canSave, orderedSermons, save, setOrderedSermons, setTitle, title } =
    usePlaylistEditForm(playlist)
  const handleSave = useCallback(() => void save(), [save])
  usePlaylistEditHeader({ canSave, onSave: handleSave })
  const handleDeleted = useCallback(() => router.back(), [router])
  const { cancelDelete, confirmDelete, isDeleteOpen, requestDelete } =
    useLocalPlaylistDelete(handleDeleted)

  const renderItem = usePlaylistEditItemRenderer()
  const handleDragEnd = useCallback(
    ({ data }: { data: SermonShape[] }) => setOrderedSermons(data),
    [setOrderedSermons],
  )

  return (
    <FormSubmitContext.Provider value={() => void save()}>
      <DraggableFlatList
        data={orderedSermons}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        containerStyle={styles.list}
        keyExtractor={sermon => sermon.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message={EMPTY_MESSAGE} />}
        ListHeaderComponent={
          <View>
            <View style={styles.field}>
              <FormField value={title} label={NAME_LABEL} onChangeText={setTitle} />
            </View>
            <Text style={[styles.count, { color: currentTheme.text }]}>
              {countTitle(orderedSermons.length)}
            </Text>
          </View>
        }
        ListFooterComponent={
          <PressableButton
            style={styles.delete}
            accessibilityLabel={DELETE_LABEL}
            onPress={() => requestDelete(playlist.id)}
          >
            <Ionicons name={DELETE_ICON} color={COLORS.error} size={DELETE_ICON_SIZE} />
            <Text style={[styles.deleteText, { color: COLORS.error }]}>{DELETE_LABEL}</Text>
          </PressableButton>
        }
      />
      <View style={[styles.footer, { borderTopColor: currentTheme.skeleton }]}>
        <PressableButton
          disabled={!canSave}
          onPress={handleSave}
          style={[styles.save, !canSave && styles.saveDisabled]}
        >
          <Text style={[styles.saveText, { color: currentTheme.primary }]}>{SAVE_LABEL}</Text>
        </PressableButton>
      </View>
      <LocalPlaylistDeleteDialog
        visible={isDeleteOpen}
        onCancel={cancelDelete}
        onConfirm={() => void confirmDelete()}
      />
    </FormSubmitContext.Provider>
  )
}
