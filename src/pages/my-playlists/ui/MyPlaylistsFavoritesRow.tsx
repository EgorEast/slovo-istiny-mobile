import { Ionicons } from '@expo/vector-icons'
import { ListItemBase, SURFACE_ARTWORK_SIZE } from 'entities/list-item'
import { type LocalPlaylistData } from 'entities/playlist'
import { useTheme } from 'shared/ui/theme'
import { MyPlaylistsMarkerAvatar } from './MyPlaylistsMarkerAvatar'

const HEART_ICON = 'heart'

// Строка «Избранные»: первая в списке (не закреплена — скроллится вместе с
// остальными), не перетаскивается. Сердце — тот же визуальный маркер, что у
// карточки на экране «Слушать»; оно лежит в слоте обложки `surface`-строки,
// поэтому строка совпадает по геометрии со строками плейлистов и админки.
export const MyPlaylistsFavoritesRow = ({
  onPress,
  playlist,
}: {
  onPress: () => void
  playlist: LocalPlaylistData
}) => {
  const { currentTheme } = useTheme()

  return (
    <ListItemBase
      onPress={onPress}
      variant='surface'
      title={playlist.title}
      artworkNode={
        <MyPlaylistsMarkerAvatar
          size={SURFACE_ARTWORK_SIZE}
          renderIcon={iconSize => (
            <Ionicons size={iconSize} name={HEART_ICON} color={currentTheme.primary} />
          )}
        />
      }
    />
  )
}
