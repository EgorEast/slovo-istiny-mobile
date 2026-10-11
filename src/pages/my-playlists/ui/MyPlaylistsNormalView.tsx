import { StyleSheet, View } from 'react-native'
import { type LocalPlaylistData } from 'entities/playlist'
import { EmptyState } from 'shared/ui'
import { INDENTS } from 'shared/ui/theme'
import { MyPlaylistsCreateRow } from './MyPlaylistsCreateRow'
import { MyPlaylistsDragList } from './MyPlaylistsDragList'
import { MyPlaylistsFavoritesRow } from './MyPlaylistsFavoritesRow'

const EMPTY_MESSAGE = 'Своих плейлистов пока нет'

// Обычный (просмотровый) режим экрана «Мои плейлисты»: строка «Избранные» идёт
// первой в самом списке (шапкой скролла, а не закреплённой над ним — нижний
// отступ `surface`-строки отделяет её от плейлистов), вертикальный список
// остальных плейлистов без drag и завершающая строка «Создать плейлист» в
// футере списка, то есть под плейлистами.
export const MyPlaylistsNormalView = ({
  favorites,
  onPressCreate,
  onPressFavorites,
  onPressPlaylist,
  orderedRest,
}: {
  favorites?: LocalPlaylistData
  onPressCreate: () => void
  onPressFavorites: () => void
  onPressPlaylist: (playlist: LocalPlaylistData) => void
  orderedRest: LocalPlaylistData[]
}) => (
  <MyPlaylistsDragList
    items={orderedRest}
    isDraggingEnabled={false}
    onDragEnd={() => undefined}
    onPressItem={onPressPlaylist}
    listEmpty={<EmptyState message={EMPTY_MESSAGE} />}
    listFooter={
      <View style={styles.create}>
        <MyPlaylistsCreateRow onPress={onPressCreate} />
      </View>
    }
    listHeader={
      favorites ? (
        <MyPlaylistsFavoritesRow playlist={favorites} onPress={onPressFavorites} />
      ) : undefined
    }
  />
)

const styles = StyleSheet.create({
  create: { marginBottom: INDENTS.middle },
})
