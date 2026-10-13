import { useAction } from '@reatom/npm-react'
import { useCallback, useState } from 'react'
import { type APITypes, sermonsApi } from 'shared/api'
import { showToast } from 'shared/model'

const NO_ARTWORK_MESSAGE = 'У плейлиста нет обложки'
const UPDATE_FAILED_MESSAGE = 'Не удалось обновить обложки у некоторых проповедей'
const UPDATE_SUCCESS_MESSAGE = 'Обложки обновлены'

// Тело PATCH /sermons/{id} собирается из строки плейлиста; единственное
// переопределение — обложка плейлиста. `playlistsIds` — полный список связей
// (пустой массив допустим), поэтому маппим `playlists` элемента.
const toArtworkUpdateDto = (
  sermon: APITypes.PlaylistSermon,
  artwork: string,
): APITypes.UpdateSermonDto => ({
  artist: sermon.artist,
  artwork,
  audioUrl: sermon.audioUrl,
  book: sermon.book,
  chapter: sermon.chapter,
  description: sermon.description,
  playlistsIds: sermon.playlists.map(playlist => playlist.id),
  textFileUrl: sermon.textFileUrl,
  title: sermon.title,
  verse: sermon.verse,
  youtubeUrl: sermon.youtubeUrl,
})

const tryUpdateSermonArtwork = async (
  sermon: APITypes.PlaylistSermon,
  artwork: string,
): Promise<boolean> => {
  try {
    await sermonsApi
      .getSermons()
      .sermonControllerUpdate(sermon.id, toArtworkUpdateDto(sermon, artwork))
    return true
  } catch (error) {
    console.error('[useSetArtworkFromPlaylist] failed to update sermon artwork:', error)
    return false
  }
}

/**
 * Назначает обложку плейлиста всем его проповедям через `PATCH /sermons/{id}`.
 * Без обложки плейлиста операция не выполняется (только тост). Обновления идут
 * последовательно; частичный отказ не прерывает остальные, но показывается
 * тостом и логируется. После прогона данные детали перезапрашиваются.
 * @param root0 - Пропсы хука.
 * @param root0.playlist - Сущность плейлиста (источник обложки).
 * @param root0.refresh - Тихий перезапрос детали после мутаций.
 * @param root0.sermons - Проповеди плейлиста для обновления.
 */
export const useSetArtworkFromPlaylist = ({
  playlist,
  refresh,
  sermons,
}: {
  playlist: APITypes.PlaylistEntity
  refresh: () => Promise<void>
  sermons: APITypes.PlaylistSermon[]
}) => {
  const showToastAction = useAction(showToast)
  const [isConfirmVisible, setConfirmVisible] = useState(false)

  const openConfirm = useCallback(() => setConfirmVisible(true), [])
  const closeConfirm = useCallback(() => setConfirmVisible(false), [])

  const confirm = useCallback(async () => {
    setConfirmVisible(false)

    const { artwork } = playlist
    if (!artwork) {
      showToastAction(NO_ARTWORK_MESSAGE)
      return
    }

    let hasFailure = false
    for (const sermon of sermons) {
      const succeeded = await tryUpdateSermonArtwork(sermon, artwork)
      if (!succeeded) hasFailure = true
    }

    showToastAction(hasFailure ? UPDATE_FAILED_MESSAGE : UPDATE_SUCCESS_MESSAGE)
    await refresh()
  }, [playlist, refresh, sermons, showToastAction])

  return { closeConfirm, confirm, isConfirmVisible, openConfirm }
}
