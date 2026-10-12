import { createCtx } from '@reatom/framework'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { View } from 'react-native'
import { FAVORITES_PLAYLIST, myPlaylistsAtom } from 'entities/playlist'
import { renderWithProviders } from 'shared/mocks/renderWithProviders'
import { isCachingPlaylistAtom } from '../model'
import { PlaylistHeaderMenu } from './PlaylistHeaderMenu'

jest.mock('shared/ui/menu', () => {
  const { View: RNView } = jest.requireActual('react-native')
  return {
    AnchoredDropdown: ({
      children,
      onClose,
      visible,
    }: {
      children: React.ReactNode
      onClose: () => void
      visible: boolean
    }) => {
      if (!visible) return null
      return (
        <RNView testID='anchored-dropdown'>
          <RNView testID='backdrop' onTouchEnd={onClose} />
          {children}
        </RNView>
      )
    },
  }
})

jest.mock('entities/offline-cache', () => {
  const actual = jest.requireActual('entities/offline-cache')
  return {
    ...actual,
    audioCacheService: {
      ...actual.audioCacheService,
      isCached: jest.fn().mockResolvedValue(false),
    },
  }
})

const mockMarkSermonsListenedAction = jest.fn()
const mockRemoveSermonsFromHistoryAction = jest.fn()
const mockUseHistoryProgressMap = jest.fn(() => new Map<string, number>())
const mockUseHistorySermonIds = jest.fn(() => new Set<string>())
const mockBack = jest.fn()
const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}))

jest.mock('entities/listening-history', () => ({
  markSermonsListenedAction: (...args: unknown[]) => mockMarkSermonsListenedAction(...args),
  removeSermonsFromHistoryAction: (...args: unknown[]) =>
    mockRemoveSermonsFromHistoryAction(...args),
  useHistoryProgressMap: () => mockUseHistoryProgressMap(),
  useHistorySermonIds: () => mockUseHistorySermonIds(),
}))

const TRACKS = [{ audioUrl: 'http://example.com/1.mp3', id: '1', title: 'Первая' }]

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
  audioUrl: 'https://example.com/2.mp3',
  id: 'sermon-2',
  title: 'Вторая',
}

const PLAYLIST_TITLE = 'Плейлист'

const PLAYLIST = {
  artwork: null,
  description: '',
  id: 'pl-1',
  sermons: [SERMON_1, SERMON_2],
  title: PLAYLIST_TITLE,
}

const MARK_ALL_TEXT = 'Пометить все прослушанными'
const REMOVE_TEXT = 'Удалить проповеди из истории'
const ADD_ALL_TO_PLAYLIST_TEXT = 'Добавить все проповеди в плейлист'
const MARK_CONFIRM_TEXT = 'Пометить'
const REMOVE_CONFIRM_TEXT = 'Удалить'
const EDIT_LABEL = 'Редактировать плейлист'
const DELETE_MENU_TEXT = 'Удалить плейлист'
const DELETE_DIALOG_TITLE = 'Удалить плейлист?'
const DELETE_CONFIRM_TEXT = 'Удалить'

const renderMenu = async () => {
  const ctx = createCtx()
  const utils = await renderWithProviders(
    <PlaylistHeaderMenu tracksData={TRACKS} playlist={PLAYLIST} playlistTitle={PLAYLIST_TITLE} />,
    { ctx },
  )
  return { ...utils, ctx }
}

const MENU_BUTTON_LABEL = 'Меню плейлиста'

const openMenu = async () => {
  const utils = await renderMenu()
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
  })
  return utils
}

describe('<PlaylistHeaderMenu>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseHistoryProgressMap.mockReturnValue(new Map<string, number>())
    mockUseHistorySermonIds.mockReturnValue(new Set<string>())
    // In Jest, host-component measureInWindow never fires its callback, so the
    // header menu would never open. Mock the measurement with fixed geometry.
    jest
      .spyOn(View.prototype, 'measureInWindow')
      .mockImplementation((cb: (x: number, y: number, width: number, height: number) => void) => {
        cb(300, 100, 44, 44)
        return undefined
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('header menu button never disables during caching', async () => {
    const ctx = createCtx()
    isCachingPlaylistAtom(ctx, true)

    const { getByRole } = await renderWithProviders(
      <PlaylistHeaderMenu tracksData={TRACKS} playlist={PLAYLIST} playlistTitle={PLAYLIST_TITLE} />,
      { ctx },
    )

    await act(async () => {
      await Promise.resolve()
    })

    const button = getByRole('button', { name: MENU_BUTTON_LABEL })
    expect(button.props.accessibilityState?.disabled).not.toBe(true)
    expect(button.props.disabled).not.toBe(true)
  })

  test('mark-all flow: confirm calls markSermonsListenedAction with all playable audios + playlist', async () => {
    await openMenu()

    fireEvent.press(await waitFor(() => screen.getByText(MARK_ALL_TEXT)))
    fireEvent.press(await waitFor(() => screen.getByText(MARK_CONFIRM_TEXT)))

    expect(mockMarkSermonsListenedAction).toHaveBeenCalledTimes(1)
    const [ctxArg, audios, playlist] = mockMarkSermonsListenedAction.mock.calls[0]
    expect(ctxArg).toBeDefined()
    expect(audios).toEqual([SERMON_1, SERMON_2])
    expect(playlist).toEqual(PLAYLIST)
  })

  test('mark-all flow with mixed playlist: confirm passes only playable audios', async () => {
    const mixedPlaylist = { ...PLAYLIST, sermons: [SERMON_1, { ...SERMON_2, audioUrl: null }] }
    const ctx = createCtx()
    await renderWithProviders(
      <PlaylistHeaderMenu
        tracksData={TRACKS}
        playlist={mixedPlaylist}
        playlistTitle={PLAYLIST_TITLE}
      />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    fireEvent.press(await waitFor(() => screen.getByText(MARK_ALL_TEXT)))
    fireEvent.press(await waitFor(() => screen.getByText(MARK_CONFIRM_TEXT)))

    expect(mockMarkSermonsListenedAction).toHaveBeenCalledTimes(1)
    const [, audios] = mockMarkSermonsListenedAction.mock.calls[0]
    expect(audios).toEqual([SERMON_1])
  })

  test('remove flow: confirm calls removeSermonsFromHistoryAction with all sermon ids', async () => {
    mockUseHistorySermonIds.mockReturnValue(new Set(['sermon-1']))
    await openMenu()

    fireEvent.press(await waitFor(() => screen.getByText(REMOVE_TEXT)))
    fireEvent.press(await waitFor(() => screen.getByText(REMOVE_CONFIRM_TEXT)))

    expect(mockRemoveSermonsFromHistoryAction).toHaveBeenCalledTimes(1)
    const [ctxArg, sermonIds] = mockRemoveSermonsFromHistoryAction.mock.calls[0]
    expect(ctxArg).toBeDefined()
    expect(sermonIds).toEqual(['sermon-1', 'sermon-2'])
  })

  test('gating: mark-all hidden when every playable sermon is completed', async () => {
    mockUseHistoryProgressMap.mockReturnValue(
      new Map([
        ['sermon-1', 1],
        ['sermon-2', 1],
      ]),
    )
    mockUseHistorySermonIds.mockReturnValue(new Set(['sermon-1', 'sermon-2']))
    await openMenu()

    expect(screen.queryByText(MARK_ALL_TEXT)).toBeNull()
    expect(screen.getByText(REMOVE_TEXT)).toBeTruthy()
  })

  test('gating: remove hidden when no sermon is in history', async () => {
    await openMenu()

    expect(screen.getByText(MARK_ALL_TEXT)).toBeTruthy()
    expect(screen.queryByText(REMOVE_TEXT)).toBeNull()
  })

  test('gating: both hidden when playlist has no playable sermons', async () => {
    const noAudioPlaylist = { ...PLAYLIST, sermons: [{ ...SERMON_1, audioUrl: null }] }
    const ctx = createCtx()
    await renderWithProviders(
      <PlaylistHeaderMenu
        tracksData={TRACKS}
        playlist={noAudioPlaylist}
        playlistTitle={PLAYLIST_TITLE}
      />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    expect(screen.queryByText(MARK_ALL_TEXT)).toBeNull()
    expect(screen.queryByText(REMOVE_TEXT)).toBeNull()
  })

  test('hides the edit button for a non-local playlist', async () => {
    const ctx = createCtx()
    const { queryByLabelText } = await renderWithProviders(
      <PlaylistHeaderMenu
        isEditEnabled
        tracksData={TRACKS}
        playlist={PLAYLIST}
        playlistTitle={PLAYLIST_TITLE}
      />,
      { ctx },
    )

    expect(queryByLabelText(EDIT_LABEL)).toBeNull()
  })

  test('hides the edit button when editing is not enabled (player sheet)', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [
      FAVORITES_PLAYLIST,
      { id: 'pl-1', sermonIds: [], sermons: [], title: PLAYLIST_TITLE },
    ])
    const { queryByLabelText } = await renderWithProviders(
      <PlaylistHeaderMenu tracksData={TRACKS} playlist={PLAYLIST} playlistTitle={PLAYLIST_TITLE} />,
      { ctx },
    )

    expect(queryByLabelText(EDIT_LABEL)).toBeNull()
  })

  test('shows the edit button for a local playlist and navigates to the edit screen', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [
      FAVORITES_PLAYLIST,
      { id: 'pl-1', sermonIds: [], sermons: [], title: PLAYLIST_TITLE },
    ])
    const { getByLabelText } = await renderWithProviders(
      <PlaylistHeaderMenu
        isEditEnabled
        tracksData={TRACKS}
        playlist={PLAYLIST}
        playlistTitle={PLAYLIST_TITLE}
      />,
      { ctx },
    )

    await act(async () => {
      fireEvent.press(getByLabelText(EDIT_LABEL))
    })

    expect(mockPush).toHaveBeenCalledWith({
      params: { playlist: PLAYLIST.id },
      pathname: '/listen/playlist-edit',
    })
  })

  test('deletes a local playlist from the header menu after confirmation', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [
      FAVORITES_PLAYLIST,
      { id: 'pl-1', sermonIds: [], sermons: [], title: PLAYLIST_TITLE },
    ])
    await renderWithProviders(
      <PlaylistHeaderMenu
        isEditEnabled
        tracksData={TRACKS}
        playlist={PLAYLIST}
        playlistTitle={PLAYLIST_TITLE}
      />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    fireEvent.press(await waitFor(() => screen.getByText(DELETE_MENU_TEXT)))
    await waitFor(() => expect(screen.getByText(DELETE_DIALOG_TITLE)).toBeTruthy())

    await act(async () => {
      fireEvent.press(screen.getByText(DELETE_CONFIRM_TEXT))
    })

    await waitFor(() =>
      expect(ctx.get(myPlaylistsAtom).map(playlist => playlist.id)).toEqual([
        FAVORITES_PLAYLIST.id,
      ]),
    )
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  test('hides the delete item for the favorites playlist', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [FAVORITES_PLAYLIST])
    await renderWithProviders(
      <PlaylistHeaderMenu
        isEditEnabled
        tracksData={TRACKS}
        playlistTitle={FAVORITES_PLAYLIST.title}
        playlist={{ ...PLAYLIST, id: FAVORITES_PLAYLIST.id }}
      />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    expect(screen.queryByText(DELETE_MENU_TEXT)).toBeNull()
  })

  test('hides the delete item when editing is not enabled (player sheet)', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [
      FAVORITES_PLAYLIST,
      { id: 'pl-1', sermonIds: [], sermons: [], title: PLAYLIST_TITLE },
    ])
    await renderWithProviders(
      <PlaylistHeaderMenu tracksData={TRACKS} playlist={PLAYLIST} playlistTitle={PLAYLIST_TITLE} />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    expect(screen.queryByText(DELETE_MENU_TEXT)).toBeNull()
  })

  test('hides the add-all-to-playlist item without a callback (player sheet)', async () => {
    await openMenu()

    expect(screen.queryByText(ADD_ALL_TO_PLAYLIST_TEXT)).toBeNull()
  })

  test('hides the add-all-to-playlist item when the playlist is empty', async () => {
    const ctx = createCtx()
    await renderWithProviders(
      <PlaylistHeaderMenu
        tracksData={[]}
        onAddAllToPlaylist={jest.fn()}
        playlistTitle={PLAYLIST_TITLE}
        playlist={{ ...PLAYLIST, sermons: [] }}
      />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    expect(screen.queryByText(ADD_ALL_TO_PLAYLIST_TEXT)).toBeNull()
  })

  test('add-all-to-playlist: closes the menu and calls back with the playlist', async () => {
    const onAddAllToPlaylist = jest.fn()
    const ctx = createCtx()
    await renderWithProviders(
      <PlaylistHeaderMenu
        playlist={PLAYLIST}
        tracksData={TRACKS}
        playlistTitle={PLAYLIST_TITLE}
        onAddAllToPlaylist={onAddAllToPlaylist}
      />,
      { ctx },
    )
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: MENU_BUTTON_LABEL }))
    })

    fireEvent.press(await waitFor(() => screen.getByText(ADD_ALL_TO_PLAYLIST_TEXT)))

    expect(onAddAllToPlaylist).toHaveBeenCalledWith(PLAYLIST)
    await waitFor(() => expect(screen.queryByText(ADD_ALL_TO_PLAYLIST_TEXT)).toBeNull())
  })
})
