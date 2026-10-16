import { createCtx } from '@reatom/framework'
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { type ReactElement } from 'react'
import {
  FAVORITES_PLAYLIST,
  type LocalPlaylistData,
  myPlaylistsAtom,
  myPlaylistsLoadedAtom,
} from 'entities/playlist'
import { renderWithProviders } from 'shared/mocks'
import { type SermonShape } from 'shared/model'
import { PlaylistEditScreen } from './PlaylistEditScreen'

const mockBack = jest.fn()
const mockPush = jest.fn()
const mockRename = jest.fn()
const mockReorder = jest.fn()
const mockDrag = jest.fn()
const mockSetOptions = jest.fn()

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ playlist: 'local-1' }),
  useNavigation: () => ({ setOptions: mockSetOptions }),
  usePathname: () => '/playlist-edit',
  useRouter: () => ({ back: mockBack, push: mockPush }),
}))

// The screen hydrates the atom on mount; a real storage read would clobber the
// seeded atom. Rename/reorder are replaced with spies while the real reorder and
// delete actions stay available through the actual module.
jest.mock('entities/playlist', () => {
  const actual = jest.requireActual('entities/playlist')
  const { action } = jest.requireActual('@reatom/framework')

  return {
    ...actual,
    loadMyPlaylists: action(() => Promise.resolve([]), 'loadMyPlaylistsMock'),
    renameLocalPlaylist: action((_ctx: unknown, playlistId: unknown, title: unknown) => {
      mockRename(playlistId, title)
      return Promise.resolve()
    }, 'renameLocalPlaylistMock'),
    reorderLocalPlaylistSermons: action(
      (_ctx: unknown, playlistId: unknown, sermonIds: unknown) => {
        mockReorder(playlistId, sermonIds)
        return Promise.resolve()
      },
      'reorderLocalPlaylistSermonsMock',
    ),
  }
})

// DraggableFlatList is a pure-JS reanimated list; a FlatList passthrough renders
// the rows while injecting the real drag handle callback and capturing the real
// `onDragEnd`, so handle-only dragging and reorder can be exercised.
let mockCapturedOnDragEnd: ((info: { data: SermonShape[] }) => void) | null = null

jest.mock('react-native-draggable-flatlist', () => {
  const { FlatList } = jest.requireActual('react-native')

  return {
    __esModule: true,
    default: ({
      onDragEnd,
      renderItem,
      ...props
    }: {
      onDragEnd: (info: { data: SermonShape[] }) => void
      renderItem: (params: {
        drag: () => void
        index: number
        isActive: boolean
        item: SermonShape
      }) => null | ReactElement
    }) => {
      mockCapturedOnDragEnd = onDragEnd
      return (
        <FlatList
          {...props}
          renderItem={({ index, item }: { index: number; item: SermonShape }) =>
            renderItem({ drag: mockDrag, index, isActive: false, item })
          }
        />
      )
    },
  }
})

const NAME_LABEL = 'Название'
const SAVE_LABEL = 'Сохранить'
const HEADER_SAVE_LABEL = 'Сохранить изменения'
const DELETE_LABEL = 'Удалить плейлист'
const DRAG_LABEL = 'Переместить проповедь'
const DELETE_DIALOG_TITLE = 'Удалить плейлист?'
const DELETE_CONFIRM_TEXT = 'Удалить'

const SERMON_A: SermonShape = { artist: 'Автор A', artwork: null, id: 's1', title: 'Проповедь A' }
const SERMON_B: SermonShape = { artist: 'Автор B', artwork: null, id: 's2', title: 'Проповедь B' }

const PLAYLIST: LocalPlaylistData = {
  id: 'local-1',
  sermonIds: ['s1', 's2'],
  sermons: [SERMON_A, SERMON_B],
  title: 'Мой плейлист',
}

const renderScreen = async () => {
  const ctx = createCtx()
  myPlaylistsAtom(ctx, [FAVORITES_PLAYLIST, PLAYLIST])
  myPlaylistsLoadedAtom(ctx, true)

  return renderWithProviders(<PlaylistEditScreen />, { ctx })
}

type HeaderRight = () => ReactElement

// The header save action is installed through `navigation.setOptions`; render the
// captured `headerRight` so its enabled state and onPress can be exercised.
const getHeaderRight = (): HeaderRight | undefined => {
  const calls = mockSetOptions.mock.calls
  for (let index = calls.length - 1; index >= 0; index -= 1) {
    const [options] = calls[index] as [{ headerRight?: HeaderRight }]
    if (options?.headerRight) return options.headerRight
  }
  return undefined
}

const renderHeader = async (ctx: ReturnType<typeof createCtx>) => {
  const headerRight = getHeaderRight()
  if (!headerRight) throw new Error('headerRight was never set')

  return renderWithProviders(<>{headerRight()}</>, { ctx })
}

describe('<PlaylistEditScreen>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCapturedOnDragEnd = null
  })

  test('renders the title field and the sermon list with drag handles', async () => {
    const { getAllByLabelText, getByLabelText, getByText } = await renderScreen()

    expect(getByLabelText(NAME_LABEL).props.value).toBe('Мой плейлист')
    expect(getByText('Проповеди (2)')).toBeTruthy()
    expect(getByText(SERMON_A.title)).toBeTruthy()
    expect(getByText(SERMON_B.title)).toBeTruthy()
    expect(getAllByLabelText(DRAG_LABEL)).toHaveLength(2)
  })

  test('starts the drag from the handle and ignores a long-press on the row body', async () => {
    const { getAllByLabelText, getByText } = await renderScreen()

    fireEvent(getAllByLabelText(DRAG_LABEL)[0], 'pressIn')
    expect(mockDrag).toHaveBeenCalledTimes(1)

    fireEvent(getByText(SERMON_A.title), 'longPress')
    expect(mockDrag).toHaveBeenCalledTimes(1)
  })

  test('renames the playlist on save and goes back', async () => {
    const { getByLabelText, getByText } = await renderScreen()

    await act(async () => {
      fireEvent.changeText(getByLabelText(NAME_LABEL), '  Новое  ')
    })
    fireEvent.press(getByText(SAVE_LABEL))

    await waitFor(() => expect(mockRename).toHaveBeenCalledWith('local-1', 'Новое'))
    expect(mockReorder).not.toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  test('reorders the sermons on save and goes back', async () => {
    const { getByText } = await renderScreen()

    await act(async () => {
      mockCapturedOnDragEnd?.({ data: [SERMON_B, SERMON_A] })
    })
    fireEvent.press(getByText(SAVE_LABEL))

    await waitFor(() => expect(mockReorder).toHaveBeenCalledWith('local-1', ['s2', 's1']))
    expect(mockRename).not.toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  test('does not save while nothing changed', async () => {
    const { getByText } = await renderScreen()

    fireEvent.press(getByText(SAVE_LABEL))

    expect(mockRename).not.toHaveBeenCalled()
    expect(mockReorder).not.toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()
  })

  test('shows a header save button that does nothing while unchanged', async () => {
    const screen = await renderScreen()
    const header = await renderHeader(screen.ctx)

    fireEvent.press(header.getByLabelText(HEADER_SAVE_LABEL))

    expect(mockRename).not.toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()
  })

  test('saves the rename from the header save button', async () => {
    const screen = await renderScreen()

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(NAME_LABEL), 'Новое')
    })
    const header = await renderHeader(screen.ctx)

    fireEvent.press(header.getByLabelText(HEADER_SAVE_LABEL))

    await waitFor(() => expect(mockRename).toHaveBeenCalledWith('local-1', 'Новое'))
    expect(mockReorder).not.toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  test('deletes the playlist after confirmation and goes back', async () => {
    const { getByLabelText, getByText } = await renderScreen()

    fireEvent.press(getByLabelText(DELETE_LABEL))
    await waitFor(() => expect(getByText(DELETE_DIALOG_TITLE)).toBeTruthy())

    fireEvent.press(getByText(DELETE_CONFIRM_TEXT))

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1))
  })

  test('shows the not-found state for an unknown playlist', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [FAVORITES_PLAYLIST])
    myPlaylistsLoadedAtom(ctx, true)

    const { getByText } = await renderWithProviders(<PlaylistEditScreen />, { ctx })

    expect(getByText('Плейлист не найден')).toBeTruthy()
  })
})
