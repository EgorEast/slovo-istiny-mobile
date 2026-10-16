import { StyleSheet, View } from 'react-native'
import { INDENTS, useTheme } from 'shared/ui/theme'

export const PlaylistMenuDivider = () => {
  const { currentTheme } = useTheme()

  return <View style={[styles.divider, { backgroundColor: currentTheme.textMuted }]} />
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginHorizontal: INDENTS.medium,
    opacity: 0.3,
  },
})
