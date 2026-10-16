import { PlaylistAddAllMenuItem } from './PlaylistAddAllMenuItem'
import { PlaylistMenuDivider } from './PlaylistMenuDivider'
import { PlaylistPublishMenuItem, PUBLISH_TEXT } from './PlaylistPublishMenuItem'

/**
 * Batch rows of the playlist header menu («Добавить все проповеди» and «Добавить в
 * глобальные»), preceded by the divider that separates them from the share row. Each
 * row is optional: the add-all row only on the playlist screen (non-empty playlist),
 * the publish row only for admins on local playlists.
 * @param root0 - Batch row state and handlers.
 * @param root0.canPublish - Show the publish row (admins on local playlists).
 * @param root0.onAddAllToPlaylist - Opens the batch add modal (absent in the sheet).
 * @param root0.onPublish - Publishes the playlist to the shared ones.
 */
export const PlaylistBatchMenuItems = ({
  canPublish,
  onAddAllToPlaylist,
  onPublish,
}: {
  canPublish: boolean
  onAddAllToPlaylist?: () => void
  onPublish: () => void
}) => (
  <>
    <PlaylistMenuDivider />
    {onAddAllToPlaylist && (
      <PlaylistAddAllMenuItem
        onPress={onAddAllToPlaylist}
        onboardingTargetId='playlist.menu-add-all'
      />
    )}
    {canPublish && (
      <PlaylistPublishMenuItem
        onPress={onPublish}
        text={PUBLISH_TEXT}
        onboardingTargetId='playlist.menu-publish'
      />
    )}
  </>
)
