import { memo } from 'react'
import { type PlaylistData } from 'entities/playlist'
import { TRACK_LIST_ITEM_SIZES } from 'entities/track-list'
import { PlaylistLetterAvatar } from 'shared/ui'
import { SearchListItem } from './SearchListItem'

export const SearchPlaylistRow = memo(
  ({
    onPress,
    playlist,
  }: {
    onPress: (playlist: PlaylistData) => void
    playlist: PlaylistData
  }) => (
    <SearchListItem
      title={playlist.title}
      artwork={playlist.artwork}
      subtitle={playlist.description}
      onPress={() => onPress(playlist)}
      artworkNode={
        playlist.artwork == null ? (
          <PlaylistLetterAvatar title={playlist.title} size={TRACK_LIST_ITEM_SIZES.albumArtSize} />
        ) : undefined
      }
    />
  ),
)
