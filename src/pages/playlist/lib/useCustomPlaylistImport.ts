import { useAction } from '@reatom/npm-react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  createLocalPlaylist,
  type CustomPlaylistPayload,
  deriveCustomPlaylistId,
  loadMyPlaylists,
  type LocalPlaylistData,
  parseCustomPlaylistParams,
} from 'entities/playlist'
import { showToast } from 'shared/model'

const INVALID_LINK_MESSAGE = 'Ссылка на плейлист недействительна'

// Совпадение по содержимому, а не по производному id: переименованный или
// изменённый плейлист сохраняет исходный content-id, поэтому поиск по id
// перехватывал бы повторные клики по неизменённой ссылке. Сравниваем title и
// упорядоченный список sermonIds — семантика пользователя: неизменённый
// плейлист (тот же title и тот же порядок id) → открываем его; переименован
// или изменён → создаём новый.
const hasSameContent = (playlist: LocalPlaylistData, payload: CustomPlaylistPayload): boolean =>
  playlist.title === payload.title &&
  playlist.sermonIds.length === payload.sermonIds.length &&
  playlist.sermonIds.every((sermonId, index) => sermonId === payload.sermonIds[index])

/**
 * Imports a custom local playlist from the `custom`/`title`/`sermons` route
 * params.
 *
 * The `custom` marker (present even when empty) makes the import win over the
 * `playlist` param. Params are parsed once per value: `loadMyPlaylists` is
 * awaited before the read-modify-write so `createLocalPlaylist` never runs
 * against the un-hydrated atom (which an in-flight hydration would overwrite).
 * A playlist is reused only when a local one carries the exact same content
 * (`hasSameContent`), so an unchanged share link reopens the imported playlist
 * while a renamed/edited one yields a new playlist. The route is never rewritten:
 * the share params stay in the address bar so the user can copy the link. An
 * invalid link shows a toast and clears the params. The ref guard makes the
 * import idempotent across rerenders.
 * @returns `importedPlaylistId` — the resolved/created playlist id, or `null`
 * while the import is in flight (or when there is no custom link).
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
  const [importedPlaylistId, setImportedPlaylistId] = useState<null | string>(null)
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
      const existing = playlists.find(playlist => hasSameContent(playlist, payload))
      if (existing) {
        setImportedPlaylistId(existing.id)
        return
      }

      // Коллизия возможна, когда исходный плейлист переименован/изменён, но
      // держит исходный content-id: создаём новый с uuid, не перезаписывая его.
      const derivedId = deriveCustomPlaylistId(payload)
      const id = playlists.some(playlist => playlist.id === derivedId) ? undefined : derivedId
      const created = await createPlaylist({
        id,
        sermonIds: payload.sermonIds,
        title: payload.title,
      })
      setImportedPlaylistId(created.id)
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

  return { importedPlaylistId }
}
