import { type RefObject, useState } from 'react'
import { type ColorValue, StyleSheet, View } from 'react-native'
import { EditLocalPlaylistModal } from 'features/local-playlist-form'
import { PlaylistEditButton } from './PlaylistEditButton'
import { PlaylistHeaderMenuButton } from './PlaylistHeaderMenuButton'

/**
 * Header action row for the playlist screen: an optional edit button (local
 * user-owned playlists only) followed by the menu trigger. Owns the edit form's
 * open state so the header menu stays focused on the dropdown.
 * @param props - Action row configuration.
 * @param props.accessibilityLabel - Screen-reader name of the menu trigger.
 * @param props.buttonRef - Ref to the menu wrapper view used as the dropdown anchor.
 * @param props.iconColor - Icon tint; defaults to the theme text color.
 * @param props.isEditable - Whether the playlist can be edited (shows the edit button).
 * @param props.onOpenMenu - Opens the menu dropdown.
 * @param props.playlistId - Id of the playlist being edited.
 * @param props.playlistTitle - Current title of the playlist being edited.
 */
export const PlaylistHeaderActions = ({
  accessibilityLabel,
  buttonRef,
  iconColor,
  isEditable,
  onOpenMenu,
  playlistId,
  playlistTitle,
}: {
  accessibilityLabel: string
  buttonRef: RefObject<null | View>
  iconColor?: ColorValue
  isEditable: boolean
  onOpenMenu: () => void
  playlistId: string
  playlistTitle: string
}) => {
  const [isEditVisible, setEditVisible] = useState(false)

  return (
    <>
      <View style={styles.actions}>
        {isEditable ? (
          <PlaylistEditButton iconColor={iconColor} onPress={() => setEditVisible(true)} />
        ) : null}
        <PlaylistHeaderMenuButton
          onPress={onOpenMenu}
          buttonRef={buttonRef}
          iconColor={iconColor}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
      {isEditable ? (
        <EditLocalPlaylistModal
          visible={isEditVisible}
          playlistId={playlistId}
          currentTitle={playlistTitle}
          onClose={() => setEditVisible(false)}
        />
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row' },
})
