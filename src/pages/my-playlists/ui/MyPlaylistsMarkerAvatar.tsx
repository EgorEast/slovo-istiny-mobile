import { type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { AVATAR_CONTENT_SIZE_RATIO } from 'shared/ui'
import { RADIUSES, useTheme } from 'shared/ui/theme'

/**
 * Квадратная плитка-маркер той же геометрии, что `PlaylistLetterAvatar` у строк
 * списка. Держит строки «Избранные» и «Создать плейлист» одного размера со
 * стандартными строками плейлистов, а иконка внутри масштабируется той же долей
 * (`AVATAR_CONTENT_SIZE_RATIO`), что и буква в `PlaylistLetterAvatar`, — так
 * сердце и плюс пропорциональны иконкам карточек слайдера.
 * @param root0 - Пропсы плитки.
 * @param root0.renderIcon - Рендер иконки по вычисленному размеру.
 * @param root0.size - Сторона квадрата в пикселях.
 */
export const MyPlaylistsMarkerAvatar = ({
  renderIcon,
  size,
}: {
  renderIcon: (iconSize: number) => ReactNode
  size: number
}) => {
  const { currentTheme } = useTheme()

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: currentTheme.skeleton,
          borderRadius: RADIUSES.low,
          height: size,
          width: size,
        },
      ]}
    >
      {renderIcon(size * AVATAR_CONTENT_SIZE_RATIO)}
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
