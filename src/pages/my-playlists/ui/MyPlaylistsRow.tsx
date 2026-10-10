import Ionicons from '@expo/vector-icons/Ionicons'
import { ListItemBase, SURFACE_ARTWORK_SIZE } from 'entities/list-item'
import { type LocalPlaylistData } from 'entities/playlist'
import { PlaylistLetterAvatar } from 'shared/ui'
import { IconButton } from 'shared/ui/icon-button'
import { COLORS } from 'shared/ui/theme'

const DRAG_LABEL = 'Переместить плейлист'
const DELETE_LABEL = 'Удалить плейлист'
const DELETE_ICON_SIZE = 20

// Строка локального плейлиста в `surface`-варианте — той же геометрии, что
// строки плейлистов в админ-экранах раздела. Вне редактирования тап
// навигирует. В режиме редактирования строка получает drag-ручку (как строки
// админки): перетаскивание стартует только с ручки, long-press по телу строки
// ничего не делает; тап не навигирует. Кнопка удаления показывается только
// когда вызывающий передал `onDelete`.
export const MyPlaylistsRow = ({
  drag,
  isActive,
  isDraggingEnabled,
  item,
  onDelete,
  onPress,
}: {
  drag: () => void
  isActive: boolean
  isDraggingEnabled: boolean
  item: LocalPlaylistData
  onDelete?: () => void
  onPress: () => void
}) => (
  <ListItemBase
    variant='surface'
    title={item.title}
    isActive={isActive}
    dragLabel={DRAG_LABEL}
    drag={isDraggingEnabled ? drag : undefined}
    onPress={isDraggingEnabled ? () => undefined : onPress}
    artworkNode={<PlaylistLetterAvatar title={item.title} size={SURFACE_ARTWORK_SIZE} />}
    right={
      onDelete ? (
        <IconButton
          onPress={onDelete}
          accessibilityLabel={DELETE_LABEL}
          Icon={<Ionicons name='trash-outline' color={COLORS.error} size={DELETE_ICON_SIZE} />}
        />
      ) : undefined
    }
  />
)
