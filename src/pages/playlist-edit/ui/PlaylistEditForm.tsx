import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Text, View } from 'react-native'
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist'
import { LocalPlaylistDeleteDialog, useLocalPlaylistDelete } from 'features/local-playlist-form'
import { type LocalPlaylistData } from 'entities/playlist'
import { type SermonShape } from 'shared/model'
import { EmptyState } from 'shared/ui'
import { FormField, FormSubmitContext } from 'shared/ui/form'
import { PressableButton } from 'shared/ui/pressable-button'
import { COLORS, useTheme } from 'shared/ui/theme'
import { usePlaylistEditForm } from '../lib/usePlaylistEditForm'
import { PlaylistEditSermonRow } from './PlaylistEditSermonRow'
import { styles } from './styles'

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
  const handleDeleted = useCallback(() => router.back(), [router])
  const { cancelDelete, confirmDelete, isDeleteOpen, requestDelete } =
    useLocalPlaylistDelete(handleDeleted)

  const renderItem = ({ drag, isActive, item }: RenderItemParams<SermonShape>) => (
    <PlaylistEditSermonRow item={item} drag={drag} isActive={isActive} />
  )

  return (
    <FormSubmitContext.Provider value={() => void save()}>
      <DraggableFlatList
        data={orderedSermons}
        renderItem={renderItem}
        containerStyle={styles.list}
        keyExtractor={sermon => sermon.id}
        contentContainerStyle={styles.listContent}
        onDragEnd={({ data }) => setOrderedSermons(data)}
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
          onPress={() => void save()}
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
