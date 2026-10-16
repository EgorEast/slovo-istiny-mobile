import { type ReactElement, type ReactNode } from 'react'
import { View } from 'react-native'
import { SearchGroupHeader } from './SearchGroupHeader'

/**
 * Header plus rows for one result group; renders nothing when the group is empty.
 * @param root0 - Component props.
 * @param root0.children - Rows rendered under the group header.
 * @param root0.count - Number of matches, shown in the header and gating visibility.
 * @param root0.groupHeaderWrapper - Optional page-owned wrapper around the header.
 * @param root0.label - Group title shown in the header.
 * @param root0.onPress - Called when the header is pressed (e.g. To show all matches).
 */
export const SearchGroup = ({
  children,
  count,
  groupHeaderWrapper,
  label,
  onPress,
}: {
  children: ReactNode
  count: number
  groupHeaderWrapper?: (header: ReactElement) => ReactNode
  label: string
  onPress: () => void
}) => {
  if (count === 0) return null

  const header = <SearchGroupHeader count={count} label={label} onPress={onPress} />

  return (
    <View>
      {groupHeaderWrapper ? groupHeaderWrapper(header) : header}
      {children}
    </View>
  )
}
