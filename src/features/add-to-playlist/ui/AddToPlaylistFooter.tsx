import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PressableButton } from 'shared/ui/pressable-button'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'

const CANCEL_LABEL = 'Отмена'
const SAVE_LABEL = 'Сохранить'

/**
 * Футер модалки добавления в плейлист: «Отмена» отбрасывает черновик, а
 * «Сохранить» применяет его и закрывает модалку. Сохранение недоступно, пока
 * черновик не изменён.
 * @param root0 - Пропсы футера.
 * @param root0.disabled - Сохранение недоступно (черновик не изменён).
 * @param root0.onCancel - Отменить изменения и закрыть модалку.
 * @param root0.onSave - Применить черновик и закрыть модалку.
 * @param root0.renderSaveWrapper - Оборачивает кнопку «Сохранить» (например, в онбординг-цель).
 */
export const AddToPlaylistFooter = ({
  disabled,
  onCancel,
  onSave,
  renderSaveWrapper,
}: {
  disabled: boolean
  onCancel: () => void
  onSave: () => void
  renderSaveWrapper?: (save: ReactElement) => ReactElement
}) => {
  const { currentTheme } = useTheme()

  const saveButton = (
    <PressableButton onPress={onSave} disabled={disabled} style={styles.button}>
      <Text
        style={[styles.label, { color: disabled ? currentTheme.textMuted : currentTheme.primary }]}
      >
        {SAVE_LABEL}
      </Text>
    </PressableButton>
  )

  return (
    <View style={[styles.footer, { borderTopColor: currentTheme.skeleton }]}>
      <PressableButton onPress={onCancel} style={styles.button}>
        <Text style={[styles.label, { color: currentTheme.text }]}>{CANCEL_LABEL}</Text>
      </PressableButton>
      {renderSaveWrapper === undefined ? saveButton : renderSaveWrapper(saveButton)}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    flex: 1,
    padding: INDENTS.medium,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
})
