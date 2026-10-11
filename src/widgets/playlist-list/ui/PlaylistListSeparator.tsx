import { View } from 'react-native'
import { LIST_ITEM_CARD_ARTWORK_SIZE } from 'entities/list-item'
import { INDENTS, useTheme } from 'shared/ui/theme'

const DIVIDER_LEFT_OFFSET = LIST_ITEM_CARD_ARTWORK_SIZE + INDENTS.medium + INDENTS.medium

export const PlaylistListSeparator = () => {
  const { currentTheme } = useTheme()

  return (
    <View
      style={{
        backgroundColor: currentTheme.surface,
        height: 1,
        marginLeft: DIVIDER_LEFT_OFFSET,
        marginVertical: INDENTS.low,
      }}
    />
  )
}
