import { useAtom } from '@reatom/npm-react'
import { useEffect, useMemo, useState } from 'react'
import { myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { dynamicSectionsAtom } from 'entities/section'
import { buildLocalPlaylist } from './buildLocalPlaylist'
import { buildSermonIndex } from './buildSermonIndex'
import { resolvePlaylistFromApi } from './resolvePlaylistFromApi'
import { resolvePlaylistFromCache } from './resolvePlaylistFromCache'

interface PlaylistResolution {
  playlist: PlaylistData | undefined
  playlistId: string
  tier: ResolvedTier
}

type ResolvedTier = 'api' | 'cache' | 'sections' | null

/**
 * Resolves a playlist id to a renderable playlist, trying local storage first.
 *
 * Tier 0 — a local playlist (favorites or user-owned) is built synchronously from
 * `myPlaylistsAtom`; id-only playlists resolve their ids against locally available
 * sermons. Otherwise sections, the offline cache and finally the API are tried.
 * @param playlistId - Playlist id from the route param.
 * @returns Loading/not-found flags and the resolved playlist, if any.
 */
export const usePlaylistById = (playlistId: string) => {
  const [sections] = useAtom(dynamicSectionsAtom)
  const [localPlaylists] = useAtom(myPlaylistsAtom)
  const [resolution, setResolution] = useState<PlaylistResolution>({
    playlist: undefined,
    playlistId: '',
    tier: null,
  })

  const localPlaylist = useMemo(
    () => localPlaylists.find(playlist => playlist.id === playlistId),
    [localPlaylists, playlistId],
  )
  const isLocal = localPlaylist !== undefined
  const sermonIndex = useMemo(
    () => buildSermonIndex(sections, localPlaylists),
    [sections, localPlaylists],
  )
  const localBuilt = useMemo(
    () => (localPlaylist ? buildLocalPlaylist(localPlaylist, sermonIndex) : undefined),
    [localPlaylist, sermonIndex],
  )

  const playlistFromSections = useMemo(
    () => sections.flatMap(section => section.playlists ?? []).find(p => p.id === playlistId),
    [sections, playlistId],
  )

  useEffect(() => {
    if (!playlistId || isLocal || playlistFromSections) return
    let cancelled = false

    void (async () => {
      const cachedPlaylist = await resolvePlaylistFromCache(playlistId)
      if (cancelled) return
      if (cachedPlaylist) {
        setResolution({ playlist: cachedPlaylist, playlistId, tier: 'cache' })
        return
      }

      const apiPlaylist = await resolvePlaylistFromApi(playlistId)
      if (cancelled) return
      setResolution({ playlist: apiPlaylist, playlistId, tier: 'api' })
    })()

    return () => {
      cancelled = true
    }
  }, [isLocal, playlistFromSections, playlistId])

  if (isLocal) return { isLoading: false, notFound: false, playlist: localBuilt }

  const currentResolution = resolution.playlistId === playlistId ? resolution : null
  const playlist = playlistFromSections ?? currentResolution?.playlist
  const resolvedTier: ResolvedTier = playlistFromSections
    ? 'sections'
    : (currentResolution?.tier ?? null)
  const notFound = !playlistId || (!playlist && resolvedTier !== null)
  const isLoading = !playlist && !notFound

  return { isLoading, notFound, playlist }
}
