import { action } from '@reatom/framework'
import { generateUuid } from 'shared/lib/generateUuid'
import { type LocalPlaylistData, withFavoritesFirst } from './localPlaylists'
import { persistMyPlaylists } from './localPlaylistStorage'
import { myPlaylistsAtom } from './model'

/**
 * Creates a local (user-owned) playlist and pins it right after favorites.
 *
 * The playlist stores the given `sermonIds` without sermon snapshots: snapshots
 * are added later when the user toggles membership (`togglePlaylistSermon`), and
 * imported share links carry ids only. `myPlaylistsAtom` is committed before the
 * storage write, so a failed write logs but keeps the in-memory playlist (same
 * degradation policy as `reorderMyPlaylists`).
 * @param ctx - Reatom action context.
 * @param input - Playlist title, ordered sermon ids and an optional explicit id.
 * @param input.id - Id to use instead of a generated UUID (the deterministic
 * `deriveCustomPlaylistId` of an imported share link).
 * @returns The freshly created playlist.
 */
export const createLocalPlaylist = action(
  async (ctx, input: { id?: string; sermonIds: string[]; title: string }) => {
    const playlists = ctx.get(myPlaylistsAtom)
    const created: LocalPlaylistData = {
      id: input.id ?? generateUuid(),
      sermonIds: input.sermonIds,
      sermons: [],
      title: input.title,
    }
    const nextPlaylists = withFavoritesFirst([created, ...playlists])

    await ctx.schedule(() => {
      myPlaylistsAtom(ctx, nextPlaylists)
    })
    try {
      await persistMyPlaylists(nextPlaylists)
    } catch (error) {
      console.error('[createLocalPlaylist] failed to persist playlist:', error)
    }
    return created
  },
  'createLocalPlaylist',
)
