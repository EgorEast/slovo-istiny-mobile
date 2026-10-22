import { Ionicons } from '@expo/vector-icons'
import { type ReactElement, type ReactNode, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PressableButton } from 'shared/ui/pressable-button'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { CreatePlaylistInlineForm } from './CreatePlaylistInlineForm'

const CREATE_BUTTON_LABEL = 'Создать плейлист'

/**
 * Тело модалки «Добавить в плейлист»: переключается между списком плейлистов с
 * футером и встроенной формой создания. Форма монтируется вместо списка, но
 * черновик выбора живёт выше (в контентных компонентах), поэтому галочки
 * переживают переход туда и обратно.
 * @param root0 - Пропсы тела.
 * @param root0.children - Список плейлистов и футер модалки.
 * @param root0.renderCreateWrapper - Оборачивает кнопку «Создать плейлист».
 */
export const AddToPlaylistBody = ({
  children,
  renderCreateWrapper,
}: {
  children: ReactNode
  renderCreateWrapper?: (button: ReactElement) => ReactElement
}) => {
  const { currentTheme } = useTheme()
  const [isCreating, setIsCreating] = useState(false)

  if (isCreating) return <CreatePlaylistInlineForm onFinished={() => setIsCreating(false)} />

  const createButton = (
    <PressableButton
      style={styles.createRow}
      onPress={() => setIsCreating(true)}
      accessibilityLabel={CREATE_BUTTON_LABEL}
    >
      <Ionicons name='add' size={FONT_SIZES.lg} color={currentTheme.primary} />
      <Text style={[styles.createLabel, { color: currentTheme.primary }]}>
        {CREATE_BUTTON_LABEL}
      </Text>
    </PressableButton>
  )

  return (
    <View>
      {renderCreateWrapper === undefined ? createButton : renderCreateWrapper(createButton)}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  createLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  createRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: INDENTS.low,
    paddingHorizontal: INDENTS.high,
    paddingVertical: INDENTS.medium,
  },
})
