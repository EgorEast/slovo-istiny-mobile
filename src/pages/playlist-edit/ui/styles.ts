import { StyleSheet } from 'react-native'
import { FONT_SIZES, INDENTS } from 'shared/ui/theme'

// Стили экрана редактирования локального плейлиста: поле названия и заголовок
// списка в шапке `DraggableFlatList`, удаление — в футере списка, «Сохранить» —
// в закреплённой нижней панели.
export const styles = StyleSheet.create({
  count: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: INDENTS.medium,
    marginTop: INDENTS.medium,
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
    paddingHorizontal: INDENTS.medium,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: INDENTS.medium,
  },
  save: {
    alignItems: 'center',
    padding: INDENTS.medium,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
})
