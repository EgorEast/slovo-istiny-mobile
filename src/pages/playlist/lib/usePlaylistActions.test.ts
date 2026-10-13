import { buildHistoryMenuActions } from 'entities/listening-history'
import { usePlayNewSermon } from 'entities/player'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { usePlaylistActions } from './usePlaylistActions'

jest.mock('entities/listening-history', () => ({
  buildHistoryMenuActions: jest.fn(() => [
    { icon: 'add-circle', onPress: jest.fn(), text: 'Добавить в плейлист' },
    { icon: 'checkmark-done', onPress: jest.fn(), text: 'Пометить прослушанной' },
  ]),
}))

jest.mock('entities/player', () => ({
  usePlayNewSermon: jest.fn(() => jest.fn()),
}))

const mockUseIsLocalPlaylist = jest.fn()

jest.mock('entities/playlist', () => ({
  useIsLocalPlaylist: (id: string) => mockUseIsLocalPlaylist(id),
}))

const SERMON_1 = {
  artist: 'Автор',
  artwork: 'art1.jpg',
  audioUrl: 'https://example.com/1.mp3',
  id: 'sermon-1',
  title: 'Первая',
}

const SERMON_2 = {
  artist: 'Автор',
  artwork: 'art2.jpg',
  audioUrl: null,
  id: 'sermon-2',
  title: 'Вторая',
}

const PLAYLIST = {
  artwork: null,
  description: '',
  id: 'pl-1',
  sermons: [SERMON_1, SERMON_2],
  title: 'Плейлист',
}

const ADD_TO_PLAYLIST_TEXT = 'Добавить в плейлист'
const REMOVE_FROM_PLAYLIST_TEXT = 'Удалить из плейлиста'
const CUSTOM_PLAYLIST_ID = 'custom-abcdef0123456789'
const SERVER_PLAYLIST_ID = '123e4567-e89b-42d3-a456-426614174000'

describe('usePlaylistActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsLocalPlaylist.mockReturnValue(false)
  })

  test('buildMenuActions builds history actions for playable sermon', async () => {
    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_1, SERMON_2], PLAYLIST, new Set(), new Map()),
      {},
    )

    const actions = result.current.buildMenuActions(0)

    expect(buildHistoryMenuActions).toHaveBeenCalledWith({
      inHistory: false,
      isCompleted: false,
      playlist: PLAYLIST,
      sermon: expect.objectContaining({ id: 'sermon-1' }),
    })
    expect(actions).toBeDefined()
  })

  test('buildMenuActions passes inHistory and isCompleted from history state', async () => {
    const historySermonIds = new Set(['sermon-1'])
    const progressMap = new Map([['sermon-1', 1]])

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_1], PLAYLIST, historySermonIds, progressMap),
      {},
    )

    result.current.buildMenuActions(0)

    expect(buildHistoryMenuActions).toHaveBeenCalledWith({
      inHistory: true,
      isCompleted: true,
      playlist: PLAYLIST,
      sermon: expect.objectContaining({ id: 'sermon-1' }),
    })
  })

  test('buildMenuActions threads onAddToPlaylist into the menu builder', async () => {
    const onAddToPlaylist = jest.fn()

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_1], PLAYLIST, new Set(), new Map(), onAddToPlaylist),
      {},
    )

    result.current.buildMenuActions(0)

    expect(buildHistoryMenuActions).toHaveBeenCalledWith(
      expect.objectContaining({ onAddToPlaylist }),
    )
  })

  test('buildMenuActions returns undefined for sermon without audioUrl', async () => {
    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_2], PLAYLIST, new Set(), new Map()),
      {},
    )

    expect(result.current.buildMenuActions(0)).toBeUndefined()
  })

  test('handlePressItem plays sermon with playlist', async () => {
    const playNewSermonMock = jest.fn()
    jest.mocked(usePlayNewSermon).mockReturnValue(playNewSermonMock)

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_1], PLAYLIST, new Set(), new Map()),
      {},
    )

    await result.current.handlePressItem(0)

    expect(playNewSermonMock).toHaveBeenCalledWith({ playlist: PLAYLIST, sermon: SERMON_1 })
  })

  test('handlePressItem no-ops for sermon without audioUrl', async () => {
    const playNewSermonMock = jest.fn()
    jest.mocked(usePlayNewSermon).mockReturnValue(playNewSermonMock)

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_2], PLAYLIST, new Set(), new Map()),
      {},
    )

    await result.current.handlePressItem(0)

    expect(playNewSermonMock).not.toHaveBeenCalled()
  })

  test('handlePressPlayAll plays first playable sermon', async () => {
    const playNewSermonMock = jest.fn()
    jest.mocked(usePlayNewSermon).mockReturnValue(playNewSermonMock)

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_2, SERMON_1], PLAYLIST, new Set(), new Map()),
      {},
    )

    await result.current.handlePressPlayAll()

    expect(playNewSermonMock).toHaveBeenCalledWith({ playlist: PLAYLIST, sermon: SERMON_1 })
  })

  test('handlePressPlayAll plays the provided target sermon', async () => {
    const playNewSermonMock = jest.fn()
    jest.mocked(usePlayNewSermon).mockReturnValue(playNewSermonMock)

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_1, SERMON_2], PLAYLIST, new Set(), new Map()),
      {},
    )

    await result.current.handlePressPlayAll(SERMON_2)

    expect(playNewSermonMock).toHaveBeenCalledWith({ playlist: PLAYLIST, sermon: SERMON_2 })
  })

  test('buildMenuActions adds the removal item right after add-to-playlist for a custom playlist', async () => {
    mockUseIsLocalPlaylist.mockReturnValue(true)
    const onRemoveRequest = jest.fn()
    const playlist = { ...PLAYLIST, id: CUSTOM_PLAYLIST_ID }

    const { result } = await renderHookWithProviders(
      () =>
        usePlaylistActions([SERMON_1], playlist, new Set(), new Map(), undefined, onRemoveRequest),
      {},
    )

    const actions = result.current.buildMenuActions(0)

    expect(actions?.map(action => action.text)).toEqual([
      ADD_TO_PLAYLIST_TEXT,
      REMOVE_FROM_PLAYLIST_TEXT,
      'Пометить прослушанной',
    ])
  })

  test('buildMenuActions adds the removal item for the favorites playlist', async () => {
    mockUseIsLocalPlaylist.mockReturnValue(true)
    const onRemoveRequest = jest.fn()
    const playlist = { ...PLAYLIST, id: 'favorites' }

    const { result } = await renderHookWithProviders(
      () =>
        usePlaylistActions([SERMON_1], playlist, new Set(), new Map(), undefined, onRemoveRequest),
      {},
    )

    const actions = result.current.buildMenuActions(0)

    expect(actions?.map(action => action.text)).toContain(REMOVE_FROM_PLAYLIST_TEXT)
  })

  test('buildMenuActions adds the removal item for a UUID-id playlist that is local', async () => {
    mockUseIsLocalPlaylist.mockReturnValue(true)
    const onRemoveRequest = jest.fn()
    const playlist = { ...PLAYLIST, id: SERVER_PLAYLIST_ID }

    const { result } = await renderHookWithProviders(
      () =>
        usePlaylistActions([SERMON_1], playlist, new Set(), new Map(), undefined, onRemoveRequest),
      {},
    )

    const actions = result.current.buildMenuActions(0)

    expect(actions?.map(action => action.text)).toContain(REMOVE_FROM_PLAYLIST_TEXT)
  })

  test('buildMenuActions omits the removal item for a UUID-id playlist that is not local', async () => {
    const onRemoveRequest = jest.fn()
    const playlist = { ...PLAYLIST, id: SERVER_PLAYLIST_ID }

    const { result } = await renderHookWithProviders(
      () =>
        usePlaylistActions([SERMON_1], playlist, new Set(), new Map(), undefined, onRemoveRequest),
      {},
    )

    const actions = result.current.buildMenuActions(0)

    expect(actions?.map(action => action.text)).not.toContain(REMOVE_FROM_PLAYLIST_TEXT)
  })

  test('buildMenuActions omits the removal item when no request handler is provided', async () => {
    mockUseIsLocalPlaylist.mockReturnValue(true)
    const playlist = { ...PLAYLIST, id: CUSTOM_PLAYLIST_ID }

    const { result } = await renderHookWithProviders(
      () => usePlaylistActions([SERMON_1], playlist, new Set(), new Map()),
      {},
    )

    const actions = result.current.buildMenuActions(0)

    expect(actions?.map(action => action.text)).not.toContain(REMOVE_FROM_PLAYLIST_TEXT)
  })

  test('removal item requests removal with the sermon instead of removing directly', async () => {
    mockUseIsLocalPlaylist.mockReturnValue(true)
    const onRemoveRequest = jest.fn()
    const playlist = { ...PLAYLIST, id: CUSTOM_PLAYLIST_ID }

    const { result } = await renderHookWithProviders(
      () =>
        usePlaylistActions([SERMON_1], playlist, new Set(), new Map(), undefined, onRemoveRequest),
      {},
    )

    const removal = result.current
      .buildMenuActions(0)
      ?.find(action => action.text === REMOVE_FROM_PLAYLIST_TEXT)

    expect(removal).toBeDefined()

    removal?.onPress()

    expect(onRemoveRequest).toHaveBeenCalledWith(expect.objectContaining({ id: 'sermon-1' }))
  })
})
