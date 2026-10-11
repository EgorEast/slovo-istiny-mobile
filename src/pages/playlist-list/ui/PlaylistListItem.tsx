import { LIST_ITEM_CARD_ARTWORK_SIZE, ListItemBase } from 'entities/list-item'
import { type PlaylistData } from 'entities/playlist'
import { PlaylistLetterAvatar } from 'shared/ui'

export const ALBUM_ART_SIZE = LIST_ITEM_CARD_ARTWORK_SIZE

// Строка серверного плейлиста в списке раздела. Слот обложки обязателен: без
// artwork он схлопывался бы, и высота строки падала. Поэтому при `artwork: null`
// в тот же слот кладётся плитка-буква (`PlaylistLetterAvatar`) стандартного
// размера `ALBUM_ART_SIZE` — каждая строка получает одинаковую высоту.
export const PlaylistListItem = ({
  onPress,
  playlist,
}: {
  onPress: () => void
  playlist: PlaylistData
}) => (
  <ListItemBase
    onPress={onPress}
    title={playlist.title}
    artwork={playlist.artwork}
    subtitle={playlist.description}
    artworkNode={
      playlist.artwork == null ? (
        <PlaylistLetterAvatar size={ALBUM_ART_SIZE} title={playlist.title} />
      ) : undefined
    }
  />
)
