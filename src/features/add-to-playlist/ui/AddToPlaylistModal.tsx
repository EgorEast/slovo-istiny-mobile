import { StyleSheet, Text, View } from 'react-native'
import { type SermonData } from 'entities/sermon'
import { Modal } from 'shared/ui/modal'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { useMembershipDraft } from '../lib/useMembershipDraft'
import { useSortedPlaylists } from '../lib/useSortedPlaylists'
import { AddToPlaylistFooter } from './AddToPlaylistFooter'
import { PlaylistMembershipList } from './PlaylistMembershipList'

const TITLE = 'Добавить в плейлист'

/**
 * Модалка мультивыбора плейлистов для проповеди. Открытие/закрытие держит
 * вызывающий экран (`visible`/`onClose`). Чекбоксы меняют только черновик
 * (`useMembershipDraft`); итоговый набор применяется по «Сохранить», а «Отмена»
 * и тап по фону черновик отбрасывают.
 * @param root0 - Пропсы модалки.
 * @param root0.onClose - Закрыть модалку.
 * @param root0.sermon - Проповедь (id + снапшот для добавления в плейлист).
 * @param root0.visible - Открыта ли модалка.
 */
export const AddToPlaylistModal = ({
  onClose,
  sermon,
  visible,
}: {
  onClose: () => void
  sermon: SermonData
  visible: boolean
}) => {
  const { currentTheme } = useTheme()
  const playlists = useSortedPlaylists(sermon.id)
  const { isDirty, save, toggle, values } = useMembershipDraft(sermon)

  const handleSave = () => {
    save()
    onClose()
  }

  return (
    <Modal visible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <PlaylistMembershipList values={values} items={playlists} onToggle={toggle} />
        <AddToPlaylistFooter onCancel={onClose} disabled={!isDirty} onSave={handleSave} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    paddingTop: INDENTS.medium,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    paddingBottom: INDENTS.medium,
    paddingHorizontal: INDENTS.high,
    paddingTop: INDENTS.low,
  },
})
