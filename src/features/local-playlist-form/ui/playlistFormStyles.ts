import { StyleSheet } from 'react-native'
import { FONT_SIZES, INDENTS } from 'shared/ui/theme'

// Общие стили форм создания/редактирования локального плейлиста: шапка,
// поле названия и нижние действия. Формы рендерятся внутри `Modal`.
export const playlistFormStyles = StyleSheet.create({
  container: {
    minWidth: '100%',
    paddingTop: INDENTS.medium,
  },
  delete: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: INDENTS.low,
    justifyContent: 'center',
    padding: INDENTS.medium,
  },
  deleteText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  field: {
    paddingHorizontal: INDENTS.high,
  },
  submit: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: INDENTS.medium,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
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
