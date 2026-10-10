import { useRouter } from 'expo-router'
import { type RefObject } from 'react'
import { type ColorValue, StyleSheet, View } from 'react-native'
import { PlaylistEditButton } from './PlaylistEditButton'
import { PlaylistHeaderMenuButton } from './PlaylistHeaderMenuButton'

/**
 * Header action row for the playlist screen: an optional edit button (local
 * user-owned playlists only) followed by the menu trigger. The edit button
 * navigates to the dedicated edit screen; the menu stays focused on its dropdown.
 * @param props - Action row configuration.
 * @param props.accessibilityLabel - Screen-reader name of the menu trigger.
 * @param props.buttonRef - Ref to the menu wrapper view used as the dropdown anchor.
 * @param props.iconColor - Icon tint; defaults to the theme text color.
 * @param props.isEditable - Whether the playlist can be edited (shows the edit button).
 * @param props.onOpenMenu - Opens the menu dropdown.
 * @param props.playlistId - Id of the playlist being edited.
 */
export const PlaylistHeaderActions = ({
  accessibilityLabel,
  buttonRef,
  iconColor,
  isEditable,
  onOpenMenu,
  playlistId,
}: {
  accessibilityLabel: string
  buttonRef: RefObject<null | View>
  iconColor?: ColorValue
  isEditable: boolean
  onOpenMenu: () => void
  playlistId: string
}) => {
  const router = useRouter()

  const handleEdit = () =>
    router.push({ params: { playlist: playlistId }, pathname: '/listen/playlist-edit' })

  return (
    <View style={styles.actions}>
      {isEditable ? <PlaylistEditButton onPress={handleEdit} iconColor={iconColor} /> : null}
      <PlaylistHeaderMenuButton
        onPress={onOpenMenu}
        buttonRef={buttonRef}
        iconColor={iconColor}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row' },
})
