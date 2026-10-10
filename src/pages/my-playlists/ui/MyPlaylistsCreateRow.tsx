import { Ionicons } from '@expo/vector-icons'
import { ListItemBase, SURFACE_ARTWORK_SIZE } from 'entities/list-item'
import { useTheme } from 'shared/ui/theme'
import { MyPlaylistsMarkerAvatar } from './MyPlaylistsMarkerAvatar'

const CREATE_ICON = 'add'
const CREATE_TITLE = 'Создать плейлист'

// Строка «Создать плейлист»: завершает список (футер), не перетаскивается.
// Плюс лежит в слоте обложки `surface`-строки, поэтому кнопка совпадает по
// размеру со строками плейлистов и админки.
export const MyPlaylistsCreateRow = ({ onPress }: { onPress: () => void }) => {
  const { currentTheme } = useTheme()

  return (
    <ListItemBase
      onPress={onPress}
      variant='surface'
      title={CREATE_TITLE}
      artworkNode={
        <MyPlaylistsMarkerAvatar
          size={SURFACE_ARTWORK_SIZE}
          renderIcon={iconSize => (
            <Ionicons size={iconSize} name={CREATE_ICON} color={currentTheme.primary} />
          )}
        />
      }
    />
  )
}
