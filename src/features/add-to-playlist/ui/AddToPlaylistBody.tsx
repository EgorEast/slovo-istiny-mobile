import { Ionicons } from '@expo/vector-icons'
import { type ReactElement, type ReactNode, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { IconButton } from 'shared/ui/icon-button'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { CreatePlaylistInlineForm } from './CreatePlaylistInlineForm'

const MODAL_TITLE = 'Добавить в плейлист'
const CREATE_BUTTON_LABEL = 'Создать плейлист'
const RETURN_LABEL = 'Вернуться к списку плейлистов'
const ICON_SIZE = 22

/**
 * Тело модалки «Добавить в плейлист»: владеет шапкой (заголовок и иконка-действие
 * в углу) и переключает содержимое между списком плейлистов с футером и
 * встроенной формой создания. В списке в углу — плюс «Создать плейлист», в форме
 * — крестик «Вернуться к списку плейлистов». Форма монтируется вместо списка, но
 * черновик выбора живёт выше (в контентных компонентах), поэтому галочки
 * переживают переход туда и обратно: подмена происходит ниже шапки, внутри этого
 * компонента.
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

  const createButton = (
    <IconButton
      onPress={() => setIsCreating(true)}
      accessibilityLabel={CREATE_BUTTON_LABEL}
      Icon={<Ionicons name='add' size={ICON_SIZE} color={currentTheme.primary} />}
    />
  )
  const closeButton = (
    <IconButton
      accessibilityLabel={RETURN_LABEL}
      onPress={() => setIsCreating(false)}
      Icon={<Ionicons name='close' size={ICON_SIZE} color={currentTheme.text} />}
    />
  )
  const createAction =
    renderCreateWrapper === undefined ? createButton : renderCreateWrapper(createButton)
  const headerAction = isCreating ? closeButton : createAction

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{MODAL_TITLE}</Text>
        {headerAction}
      </View>
      {isCreating ? <CreatePlaylistInlineForm onFinished={() => setIsCreating(false)} /> : children}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: INDENTS.medium,
    paddingHorizontal: INDENTS.high,
    paddingTop: INDENTS.low,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
})
