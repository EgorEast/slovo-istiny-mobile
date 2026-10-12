import { type Ctx } from '@reatom/framework'
import { currentPlaylistAtom, setCurrentPlaylistAction } from 'entities/player/@x/playlist'

/**
 * Синхронизирует контекст очереди плеера, когда проповедь удалена из играющего
 * плейлиста: боттомшит очереди и next/prev/нативный автопереход должны видеть
 * удаление сразу. Не-играющий плейлист не трогается. Контекст персистится и
 * коммитится через `setCurrentPlaylistAction` — тем же путём, что и старт
 * воспроизведения, поэтому хранилище остаётся в синхроне.
 * @param ctx - Reatom-контекст.
 * @param playlistId - Плейлист, из которого удалили проповедь.
 * @param sermonId - Id удалённой проповеди.
 */
export const syncQueueAfterSermonRemoval = async (
  ctx: Ctx,
  playlistId: string,
  sermonId: string,
): Promise<void> => {
  const playlist = ctx.get(currentPlaylistAtom)
  if (playlist?.id !== playlistId) return
  await setCurrentPlaylistAction(ctx, {
    ...playlist,
    sermons: playlist.sermons.filter(item => item.id !== sermonId),
  })
}
