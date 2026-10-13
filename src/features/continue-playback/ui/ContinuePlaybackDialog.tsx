import { FlatList, StyleSheet, Text, View } from 'react-native'
import { type PlaylistData } from 'entities/playlist'
import { Modal } from 'shared/ui/modal'
import { PressableButton } from 'shared/ui/pressable-button'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'

const TITLE = 'Где продолжить прослушивание?'
const SKIP_TEXT = 'Закрыть плеер'
const MAX_LIST_HEIGHT = 360

/**
 * Шторка выбора плейлиста для продолжения прослушивания удаляемой проповеди:
 * список кандидатов (тап — продолжить в нём) и футер «Закрыть плеер». Фон и
 * футер закрывают плеер (тот же `onSkip`, что и у вызывающей поверхности).
 * @param root0 - Пропсы шторки.
 * @param root0.candidates - Плейлисты, где проповедь есть (кроме исходного).
 * @param root0.onPick - Продолжить прослушивание в выбранном плейлисте.
 * @param root0.onSkip - Закрыть плеер, не выбирая плейлист.
 * @param root0.visible - Открыта ли шторка.
 */
export const ContinuePlaybackDialog = ({
  candidates,
  onPick,
  onSkip,
  visible,
}: {
  candidates: PlaylistData[]
  onPick: (playlist: PlaylistData) => void
  onSkip: () => void
  visible: boolean
}) => {
  const { currentTheme } = useTheme()

  return (
    <Modal visible={visible} onBackdropPress={onSkip}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <FlatList
          data={candidates}
          style={styles.list}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PressableButton
              onPress={() => onPick(item)}
              style={[styles.row, { borderBottomColor: currentTheme.skeleton }]}
            >
              <Text style={[styles.rowTitle, { color: currentTheme.text }]}>{item.title}</Text>
            </PressableButton>
          )}
        />
        <PressableButton
          onPress={onSkip}
          style={[styles.skip, { borderTopColor: currentTheme.skeleton }]}
        >
          <Text style={[styles.skipText, { color: currentTheme.text }]}>{SKIP_TEXT}</Text>
        </PressableButton>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    paddingTop: INDENTS.medium,
  },
  list: {
    maxHeight: MAX_LIST_HEIGHT,
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: INDENTS.high,
    paddingVertical: INDENTS.medium,
  },
  rowTitle: {
    fontSize: FONT_SIZES.md,
  },
  skip: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: INDENTS.medium,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    paddingBottom: INDENTS.medium,
    paddingHorizontal: INDENTS.high,
    paddingTop: INDENTS.low,
  },
})
