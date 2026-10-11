import { type LocalPlaylistData, type LocalSectionSettings } from 'entities/playlist'
import { EmptyState } from 'shared/ui'
import { MyPlaylistsDragList } from './MyPlaylistsDragList'
import { MyPlaylistsEditHeader } from './MyPlaylistsEditHeader'

const EMPTY_MESSAGE = 'Своих плейлистов пока нет'

// Режим редактирования экрана «Мои плейлисты»: админ-подобная форма оформления
// и drag-список локальных плейлистов. Перестановка стартует только с drag-ручки
// (как в админке), а каждая строка несёт кнопку удаления; «Избранные» остаются
// в шапке списка, не перетаскиваются и не удаляются.
export const MyPlaylistsEditView = ({
  favorites,
  onAppearanceChange,
  onDeletePlaylist,
  onDragEnd,
  onPressFavorites,
  onPressPlaylist,
  orderedRest,
  settings,
}: {
  favorites?: LocalPlaylistData
  onAppearanceChange: (patch: Partial<LocalSectionSettings>) => void
  onDeletePlaylist: (playlistId: string) => void
  onDragEnd: (orderedIds: string[]) => void
  onPressFavorites: () => void
  onPressPlaylist: (playlist: LocalPlaylistData) => void
  orderedRest: LocalPlaylistData[]
  settings: LocalSectionSettings
}) => (
  <MyPlaylistsDragList
    isDraggingEnabled
    items={orderedRest}
    onDragEnd={onDragEnd}
    onPressItem={onPressPlaylist}
    onDeleteItem={onDeletePlaylist}
    listEmpty={<EmptyState message={EMPTY_MESSAGE} />}
    listHeader={
      favorites ? (
        <MyPlaylistsEditHeader
          settings={settings}
          favorites={favorites}
          onPressFavorites={onPressFavorites}
          onAppearanceChange={onAppearanceChange}
        />
      ) : undefined
    }
  />
)
