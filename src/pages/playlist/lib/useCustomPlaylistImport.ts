import { useAction } from '@reatom/npm-react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { createLocalPlaylist, loadMyPlaylists, parseCustomPlaylistParams } from 'entities/playlist'
import { showToast } from 'shared/model'
import { findDuplicateLocalPlaylist } from './findDuplicateLocalPlaylist'

const INVALID_LINK_MESSAGE = 'Ссылка на плейлист недействительна'

/**
 * Imports a custom local playlist from the `custom`/`title`/`sermons` route
 * params.
 *
 * The `custom` marker (present even when empty) makes the import win over the
 * `playlist` param. Params are parsed once per value: `loadMyPlaylists` is
 * awaited before the read-modify-write so `createLocalPlaylist` never runs
 * against the un-hydrated atom (which an in-flight hydration would overwrite).
 * An identical local playlist (same title and sermon-id set) is reused instead
 * of duplicated. Finally the route is replaced with the target playlist,
 * dropping the share params. An invalid link shows a toast and clears the
 * params. The ref guard makes the import idempotent across rerenders.
 */
export const useCustomPlaylistImport = () => {
  const router = useRouter()
  const params = useLocalSearchParams<{
    custom?: string
    sermons?: string | string[]
    title?: string | string[]
  }>()
  const createPlaylist = useAction(createLocalPlaylist)
  const loadPlaylists = useAction(loadMyPlaylists)
  const showToastAction = useAction(showToast)
  const importedKeyRef = useRef<null | string>(null)
  // A bare `custom` flag is not `undefined` (null/empty on different parsers);
  // only its absence means the link is not a custom share link.
  const hasCustomParams = params.custom !== undefined
  const importKey = hasCustomParams ? JSON.stringify([params.sermons, params.title]) : null

  useEffect(() => {
    if (importKey === null || importedKeyRef.current === importKey) return
    importedKeyRef.current = importKey

    const payload = parseCustomPlaylistParams({ sermons: params.sermons, title: params.title })
    if (!payload) {
      showToastAction(INVALID_LINK_MESSAGE)
      router.setParams({ custom: undefined, sermons: undefined, title: undefined })
      return
    }

    void (async () => {
      const playlists = await loadPlaylists()
      const duplicate = findDuplicateLocalPlaylist(playlists, payload)
      const target =
        duplicate ?? (await createPlaylist({ sermonIds: payload.sermonIds, title: payload.title }))
      router.replace({ params: { playlist: target.id }, pathname: '/listen/playlist' })
    })()
  }, [
    createPlaylist,
    importKey,
    loadPlaylists,
    params.sermons,
    params.title,
    router,
    showToastAction,
  ])
}
