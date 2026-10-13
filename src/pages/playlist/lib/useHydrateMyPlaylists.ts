import { useAction } from '@reatom/npm-react'
import { useEffect } from 'react'
import { loadMyPlaylists } from 'entities/playlist'

/**
 * Hydrates `myPlaylistsAtom` once on mount.
 *
 * A custom local playlist exists only in that atom, so reloading / cold-starting
 * `?playlist=custom-…` must read storage before the resolver gives up.
 * `loadMyPlaylists` re-reads storage and commits — safe to run on every mount.
 */
export const useHydrateMyPlaylists = () => {
  const loadPlaylists = useAction(loadMyPlaylists)

  useEffect(() => {
    void loadPlaylists()
  }, [loadPlaylists])
}
