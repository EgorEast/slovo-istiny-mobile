import { createCtx } from '@reatom/framework'
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { durationAtom, positionAtom } from 'entities/player'
import { myPlaylistsAtom, type PlaylistData } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { renderWithProviders } from 'shared/mocks/renderWithProviders'
import { useContinuePlayback } from './useContinuePlayback'

const mockPlayNewSermon = jest.fn()
const mockFlush = jest.fn()

jest.mock('entities/player', () => {
  const { atom } = jest.requireActual('@reatom/framework')
  return {
    durationAtom: atom(0, 'testDurationAtom'),
    positionAtom: atom(0, 'testPositionAtom'),
    usePlayNewSermon: () => mockPlayNewSermon,
  }
})

jest.mock('entities/playlist', () => {
  const { atom } = jest.requireActual('@reatom/framework')
  return { myPlaylistsAtom: atom([], 'testMyPlaylistsAtom') }
})

jest.mock('entities/listening-history', () => ({
  flushHistoryProgressAction: (...args: unknown[]) => mockFlush(...args),
}))

const SERMON_ID = 'sermon-1'
const FROM_PLAYLIST_ID = 'source'
const SKIP_TEXT = 'Закрыть плеер'

const SERMON: AudioPlayerData = {
  artist: 'Автор',
  artwork: null,
  audioUrl: 'https://cdn/sermon-1.mp3',
  id: SERMON_ID,
  title: 'Слово',
}

const serverPlaylist = (id: string, title: string): PlaylistData => ({
  artwork: null,
  id,
  sermons: [SERMON],
  title,
})

const localPlaylist = (id: string, title: string, sermonIds: string[]) => ({
  id,
  sermonIds,
  sermons: [SERMON],
  title,
})

const renderProbe = async () => {
  const ctx = createCtx()
  const result: { current: null | ReturnType<typeof useContinuePlayback> } = { current: null }
  const Probe = () => {
    const value = useContinuePlayback()
    result.current = value
    return value.dialog
  }
  const utils = await renderWithProviders(<Probe />, { ctx })
  return { ...utils, ctx, result }
}

describe('useContinuePlayback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('offers server and local candidates, excluding the source and duplicates', async () => {
    const { ctx, getByText, queryByText, result } = await renderProbe()
    const sermon: AudioPlayerData = {
      ...SERMON,
      playlists: [
        serverPlaylist('srv-a', 'Сервер A'),
        serverPlaylist(FROM_PLAYLIST_ID, 'Источник'),
      ],
    }
    myPlaylistsAtom(ctx, [
      localPlaylist(FROM_PLAYLIST_ID, 'Источник', [SERMON_ID]),
      localPlaylist('srv-a', 'Дубль сервера', [SERMON_ID]),
      localPlaylist('loc-b', 'Локальный B', [SERMON_ID]),
      localPlaylist('loc-c', 'Локальный C', []),
    ])

    await act(async () => {
      result.current?.offer(sermon, FROM_PLAYLIST_ID, jest.fn())
    })

    expect(getByText('Сервер A')).toBeTruthy()
    expect(getByText('Локальный B')).toBeTruthy()
    expect(queryByText('Источник')).toBeNull()
    expect(queryByText('Дубль сервера')).toBeNull()
    expect(queryByText('Локальный C')).toBeNull()
  })

  test('calls onSkip immediately without a dialog when nothing else holds the sermon', async () => {
    const { result } = await renderProbe()
    const onSkip = jest.fn()

    await act(async () => {
      result.current?.offer(SERMON, FROM_PLAYLIST_ID, onSkip)
    })

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(result.current?.dialog).toBeNull()
  })

  test('picking a playlist continues playback and rewrites the history entry', async () => {
    const { ctx, getByText, queryByText, result } = await renderProbe()
    myPlaylistsAtom(ctx, [localPlaylist('loc-b', 'Локальный B', [SERMON_ID])])
    positionAtom(ctx, 5000)
    durationAtom(ctx, 10000)

    await act(async () => {
      result.current?.offer(SERMON, FROM_PLAYLIST_ID, jest.fn())
    })
    await act(async () => {
      fireEvent.press(getByText('Локальный B'))
    })

    await waitFor(() =>
      expect(mockPlayNewSermon).toHaveBeenCalledWith({
        playlist: expect.objectContaining({ id: 'loc-b' }),
        sermon: SERMON,
      }),
    )
    await waitFor(() =>
      expect(mockFlush).toHaveBeenCalledWith(ctx, {
        durationMs: 10000,
        playlist: expect.objectContaining({ id: 'loc-b' }),
        positionMs: 5000,
        sermon: SERMON,
      }),
    )
    await waitFor(() => expect(queryByText('Локальный B')).toBeNull())
  })

  test('closing the chooser calls the provided onSkip', async () => {
    const { ctx, getByText, result } = await renderProbe()
    myPlaylistsAtom(ctx, [localPlaylist('loc-b', 'Локальный B', [SERMON_ID])])
    const onSkip = jest.fn()

    await act(async () => {
      result.current?.offer(SERMON, FROM_PLAYLIST_ID, onSkip)
    })
    await act(async () => {
      fireEvent.press(getByText(SKIP_TEXT))
    })

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(mockPlayNewSermon).not.toHaveBeenCalled()
  })
})
