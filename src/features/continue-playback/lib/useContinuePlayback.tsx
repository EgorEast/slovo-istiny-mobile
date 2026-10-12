import { useCtx } from '@reatom/npm-react'
import { useCallback, useRef, useState } from 'react'
import { flushHistoryProgressAction } from 'entities/listening-history'
import { durationAtom, positionAtom, usePlayNewSermon } from 'entities/player'
import { type LocalPlaylistData, myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { ContinuePlaybackDialog } from '../ui/ContinuePlaybackDialog'
import { fetchSermonPlaylists } from './fetchSermonPlaylists'
import { resolveFullPlaylist } from './resolveFullPlaylist'

interface ContinueRequest {
  candidates: PlaylistData[]
  sermon: AudioPlayerData
}

// Локальный плейлист проецируется в PlaylistData для плеера: обложки у него нет,
// снапшоты проповедей берутся как есть.
const toPlayablePlaylist = (local: LocalPlaylistData): PlaylistData => ({
  artwork: null,
  description: '',
  id: local.id,
  sermons: local.sermons,
  title: local.title,
})

/**
 * Кандидаты для продолжения: серверные плейлисты, где проповедь есть
 * (`sermon.playlists`), и локальные, где её id в `sermonIds`, — дедуплицированные
 * по id и без исходного плейлиста.
 * @param localPlaylists - Локальные плейлисты из `myPlaylistsAtom`.
 * @param sermon - Удаляемая активная проповедь (с серверными членствами).
 * @param fromPlaylistId - Исходный плейлист, который исключается из выбора.
 */
const collectCandidates = (
  localPlaylists: LocalPlaylistData[],
  sermon: AudioPlayerData,
  fromPlaylistId: string,
): PlaylistData[] => {
  const seen = new Set<string>([fromPlaylistId])
  const candidates: PlaylistData[] = []

  const add = (playlist: PlaylistData) => {
    if (seen.has(playlist.id)) return
    seen.add(playlist.id)
    candidates.push(playlist)
  }

  for (const playlist of sermon.playlists ?? []) add(playlist)
  for (const local of localPlaylists)
    if (local.sermonIds.includes(sermon.id)) add(toPlayablePlaylist(local))

  return candidates
}

/**
 * Предлагает продолжить прослушивание удаляемой активной проповеди в другом
 * плейлисте. Вычисляет кандидатов (серверные + локальные, кроме исходного):
 * если их нет — сразу зовёт `onSkip` без диалога. Иначе открывает шторку:
 * выбор плейлиста продолжает воспроизведение (`playNewSermon`) и немедленно
 * переписывает запись истории (`flushHistoryProgressAction`) на новый контекст;
 * «Закрыть плеер»/фон зовут переданный `onSkip` (закрытие плеера вызывающим).
 * @returns `offer` — открыть предложение; `dialog` — шторка для рендера.
 */
export const useContinuePlayback = () => {
  const ctx = useCtx()
  const playNewSermon = usePlayNewSermon()
  const [request, setRequest] = useState<ContinueRequest | null>(null)
  const onSkipRef = useRef<(() => void) | null>(null)

  const offer = useCallback(
    async (sermon: AudioPlayerData, fromPlaylistId: string, onSkip: () => void) => {
      // Членства могли не сохраниться в снапшоте/хранилище (старые записи) —
      // уточняем сервером, когда локально их нет.
      const hasMemberships = (sermon.playlists ?? []).length > 0
      const playlists = hasMemberships ? sermon.playlists : await fetchSermonPlaylists(sermon.id)
      const resolvedSermon = hasMemberships ? sermon : { ...sermon, playlists }

      const candidates = collectCandidates(ctx.get(myPlaylistsAtom), resolvedSermon, fromPlaylistId)
      if (candidates.length === 0) {
        onSkip()
        return
      }
      onSkipRef.current = onSkip
      setRequest({ candidates, sermon: resolvedSermon })
    },
    [ctx],
  )

  const skip = useCallback(() => {
    setRequest(null)
    const onSkip = onSkipRef.current
    onSkipRef.current = null
    onSkip?.()
  }, [])

  const pick = useCallback(
    (playlist: PlaylistData) => {
      if (!request) return
      const { sermon } = request
      setRequest(null)
      onSkipRef.current = null
      void (async () => {
        // Лёгкий реф разворачивается до полного плейлиста, чтобы очередь и
        // автопереход работали (см. `resolveFullPlaylist`).
        const fullPlaylist = await resolveFullPlaylist(ctx, playlist)
        await playNewSermon({ playlist: fullPlaylist, sermon })
        await flushHistoryProgressAction(ctx, {
          durationMs: ctx.get(durationAtom),
          playlist: fullPlaylist,
          positionMs: ctx.get(positionAtom),
          sermon,
        })
      })()
    },
    [ctx, playNewSermon, request],
  )

  const dialog = request ? (
    <ContinuePlaybackDialog visible onPick={pick} onSkip={skip} candidates={request.candidates} />
  ) : null

  return { dialog, offer }
}
