import { ListItemBase } from 'entities/list-item'
import { sermonSubtitle } from 'entities/sermon'
import { type SermonShape } from 'shared/model'

const DRAG_LABEL = 'Переместить проповедь'

// Строка проповеди на экране редактирования плейлиста: бегущее однострочное
// название, подпись «проповедник · ссылка на Писание» (паритет с админ-экранами
// раздела) и drag-ручка. Перестановка стартует только с ручки; тап и long-press
// по телу строки ничего не делают.
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
    movingTitle
    variant='surface'
    title={item.title}
    isActive={isActive}
    dragLabel={DRAG_LABEL}
    onPress={() => undefined}
    subtitle={sermonSubtitle(item)}
  />
)
