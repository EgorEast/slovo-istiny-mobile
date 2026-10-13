import { FlatList, StyleSheet } from 'react-native'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { type PlaylistMembership } from '../lib/useSortedPlaylists'
import { PlaylistMembershipRow } from './PlaylistMembershipRow'

const MAX_LIST_HEIGHT = 360
const LIST_PADDING = INDENTS.medium

// The modal's inner scroll area. Bounded height keeps the list scrollable
// instead of letting a long playlist collection grow the dialog off-screen.
export const PlaylistMembershipList = ({
  items,
  onToggle,
  values,
}: {
  items: PlaylistMembership[]
  onToggle: (playlistId: string) => void
  values: Record<string, boolean>
}) => {
  const { currentTheme } = useTheme()

  return (
    <FlatList
      data={items}
      contentContainerStyle={styles.content}
      keyExtractor={item => item.playlist.id}
      style={[styles.list, { backgroundColor: currentTheme.surface }]}
      renderItem={({ item }) => (
        <PlaylistMembershipRow
          title={item.playlist.title}
          isContained={item.isContained}
          value={values[item.playlist.id]}
          onChange={() => onToggle(item.playlist.id)}
          sermonCount={item.playlist.sermonIds.length}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: LIST_PADDING,
    paddingVertical: INDENTS.low,
  },
  list: {
    maxHeight: MAX_LIST_HEIGHT,
  },
})
