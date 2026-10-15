import { StyleSheet, View } from 'react-native'
import { SEARCH_HEADER_HEIGHT, SearchBar } from 'features/sermon-search'

// The search input row shown above the grouped results while search is open.
export const ListenSearchHeader = () => (
  <View style={styles.header}>
    <SearchBar />
  </View>
)

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: SEARCH_HEADER_HEIGHT,
    zIndex: 1,
  },
})
