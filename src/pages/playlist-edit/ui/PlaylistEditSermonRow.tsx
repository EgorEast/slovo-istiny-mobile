import { ListItemBase } from 'entities/list-item'
import { type SermonShape } from 'shared/model'

const DRAG_LABEL = 'Переместить проповедь'

// Строка проповеди на экране редактирования плейлиста: drag-ручка (как в
// админ-экранах раздела) и тело без действий. Перестановка стартует только с
// ручки; тап и long-press по телу строки ничего не делают.
export const PlaylistEditSermonRow = ({
  drag,
  isActive,
  item,
}: {
  drag: () => void
  isActive: boolean
  item: SermonShape
}) => (
  <ListItemBase
    drag={drag}
    variant='surface'
    title={item.title}
    isActive={isActive}
    subtitle={item.artist}
    dragLabel={DRAG_LABEL}
    onPress={() => undefined}
  />
)
