import { useAtom } from '@reatom/npm-react'
import { useEffect, useMemo, useState } from 'react'
import {
  collectMatchingPreachers,
  fetchPlaylistTitleMatches,
  fetchSermonResults,
  mergePlaylistMatches,
  persistPlaylistSearchResults,
  persistSermonSearchResults,
  selectLocalPlaylistMatches,
} from 'features/sermon-search'
import { myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { type SearchResultsType } from './parseSearchResultsParams'

const FULL_SERMONS_TAKE = 100
const FULL_PLAYLISTS_LIMIT = 100

/**
 * Fetches the full result list for one group, always from the network first
 * (with the feature's per-query cache as offline fallback). Not cached in the
 * compact atoms, which hold truncated data.
 * @param type - Result group to load.
 * @param query - Search query (already validated/trimmed).
 */
export const useSearchResults = (type: SearchResultsType, query: string) => {
  const [myPlaylists] = useAtom(myPlaylistsAtom)
  const [sermons, setSermons] = useState<SermonData[]>([])
  const [serverPlaylists, setServerPlaylists] = useState<PlaylistData[]>([])
  const [preachers, setPreachers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!query) return

    let cancelled = false

    const load = async () => {
      if (cancelled) return
      setIsLoading(true)

      if (type === 'playlists') {
        const result = await fetchPlaylistTitleMatches(query, FULL_PLAYLISTS_LIMIT)
        if (cancelled) return
        persistPlaylistSearchResults(query, result)
        setServerPlaylists(result.data)
        return
      }

      const result = await fetchSermonResults(query, FULL_SERMONS_TAKE)
      if (cancelled) return
      persistSermonSearchResults(query, result)
      if (type === 'sermons') setSermons(result.data)
      else setPreachers(collectMatchingPreachers(result.data, query))
    }

    void load().finally(() => {
      if (!cancelled) setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [query, type])

  // Local matches merge at render, not inside the fetch effect: `myPlaylistsAtom`
  // yields a fresh array on every hydration/toggle, and depending on it in the
  // effect would re-run (and duplicate) the network fetch each time.
  const playlists = useMemo(
    () =>
      type === 'playlists'
        ? mergePlaylistMatches(selectLocalPlaylistMatches(myPlaylists, query), serverPlaylists)
        : [],
    [myPlaylists, query, serverPlaylists, type],
  )

  return { isLoading, playlists, preachers, sermons }
}
