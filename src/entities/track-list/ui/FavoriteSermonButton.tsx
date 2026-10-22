import { Ionicons } from '@expo/vector-icons'
import { type StyleProp, type ViewStyle } from 'react-native'
import { useFavoriteSermon } from 'entities/playlist/@x/track-list'
import { type SermonShape } from 'shared/model'
import { IconButton } from 'shared/ui/icon-button'
import { useTheme } from 'shared/ui/theme'

const ADD_TO_FAVORITES_LABEL = 'Добавить в избранное'
const REMOVE_FROM_FAVORITES_LABEL = 'Убрать из избранного'
const HEART_ICON_SIZE = 22

/**
 * Сердечко «в избранном» для строки проповеди.
 *
 * Состояние и переключение берутся из `useFavoriteSermon`: клик пишет проповедь
 * в локальный плейлист «Избранные» (или убирает её оттуда).
 * @param root0 - Свойства кнопки.
 * @param root0.sermon - Проповедь строки.
 * @param root0.style - Внешние стили кнопки (например, отступы строки).
 */
export const FavoriteSermonButton = ({
  sermon,
  style,
}: {
  sermon: SermonShape
  style?: StyleProp<ViewStyle>
}) => {
  const { currentTheme } = useTheme()
  const { isFavorite, toggleFavorite } = useFavoriteSermon(sermon)

  return (
    <IconButton
      style={style}
      onPress={toggleFavorite}
      accessibilityLabel={isFavorite ? REMOVE_FROM_FAVORITES_LABEL : ADD_TO_FAVORITES_LABEL}
      Icon={
        <Ionicons
          size={HEART_ICON_SIZE}
          name={isFavorite ? 'heart' : 'heart-outline'}
          color={isFavorite ? currentTheme.primary : currentTheme.textMuted}
        />
      }
    />
  )
}
