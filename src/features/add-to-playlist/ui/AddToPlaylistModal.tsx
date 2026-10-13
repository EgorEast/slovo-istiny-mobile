import { StyleSheet, Text, View } from 'react-native'
import { Modal } from 'shared/ui/modal'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { type AddToPlaylistState } from '../lib/addToPlaylistState'
import { AddAllToPlaylistContent } from './AddAllToPlaylistContent'
import { AddSermonToPlaylistContent } from './AddSermonToPlaylistContent'

const TITLE = 'Добавить в плейлист'

/**
 * Модалка мультивыбора плейлистов. Открытие/закрытие держит вызывающий экран
 * (`visible`/`onClose`), а `state` выбирает режим: одна проповедь
 * (`kind: 'sermon'`) или все проповеди исходного плейлиста (`kind: 'all'`).
 * Чекбоксы меняют только черновик; итоговый набор применяется по «Сохранить», а
 * «Отмена» и тап по фону черновик отбрасывают.
 * @param root0 - Пропсы модалки.
 * @param root0.onClose - Закрыть модалку.
 * @param root0.state - Режим и данные (проповедь или исходный плейлист).
 * @param root0.visible - Открыта ли модалка.
 */
export const AddToPlaylistModal = ({
  onClose,
  state,
  visible,
}: {
  onClose: () => void
  state: AddToPlaylistState
  visible: boolean
}) => {
  const { currentTheme } = useTheme()

  return (
    <Modal visible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        {state.kind === 'sermon' ? (
          <AddSermonToPlaylistContent onClose={onClose} sermon={state.sermon} />
        ) : (
          <AddAllToPlaylistContent onClose={onClose} playlist={state.playlist} />
        )}
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
