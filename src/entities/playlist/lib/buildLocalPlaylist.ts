import { type SermonShape } from 'shared/model'
import { type LocalPlaylistData } from '../localPlaylists'
import { type PlaylistData } from '../model'

/**
 * Projects a local playlist into a renderable `PlaylistData`.
 *
 * Prefers stored snapshots; when there are none (an id-only playlist imported
 * from a share link), the ids are resolved against locally available sermons and
 * every unknown id is skipped.
 * @param local - Local playlist entry from `myPlaylistsAtom`.
 * @param sermonIndex - Sermons resolvable without a network call.
 * @returns The playlist ready to render.
 */
export const buildLocalPlaylist = (
  local: LocalPlaylistData,
  sermonIndex: Map<string, SermonShape>,
): PlaylistData => {
  const sermons =
    local.sermons.length > 0
      ? local.sermons
      : local.sermonIds.flatMap(id => {
          const sermon = sermonIndex.get(id)
          return sermon ? [sermon] : []
        })

  return { artwork: null, description: '', id: local.id, sermons, title: local.title }
}
