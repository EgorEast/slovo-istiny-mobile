import { type Atom, createCtx } from '@reatom/framework'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native'
import { type ReactElement } from 'react'
import { View } from 'react-native'
import { type LocalPlaylistData, type PlaylistData } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { renderWithProviders } from 'shared/mocks/renderWithProviders'
import { toastAtom } from 'shared/model'
import { type AddToPlaylistControls } from '../lib/addToPlaylistControls'
import { AddToPlaylistModal } from './AddToPlaylistModal'

const mockTogglePlaylistSermon = jest.fn()

// Reatom v1001 atoms are callable at runtime (ctx, value) but the public Atom
// type exposes no call signature, hence the intersection for seeding in tests.
type SeedableAtom<T> = Atom<T> & ((ctx: unknown, value: T) => void)

// eslint-disable-next-line sonarjs/no-duplicate-string -- module id is unavoidable here
jest.mock('entities/playlist', () => {
  const actual = jest.requireActual('entities/playlist')
  return {
    ...actual,
    togglePlaylistSermon: (...args: unknown[]) => mockTogglePlaylistSermon(...args),
  }
})

const { FAVORITES_PLAYLIST, MAX_CUSTOM_PLAYLIST_SERMONS, myPlaylistsAtom, myPlaylistsLoadedAtom } =
  jest.requireActual('entities/playlist') as {
    FAVORITES_PLAYLIST: { id: string; sermonIds: string[]; sermons: unknown[]; title: string }
    MAX_CUSTOM_PLAYLIST_SERMONS: number
    myPlaylistsAtom: SeedableAtom<LocalPlaylistData[]>
    myPlaylistsLoadedAtom: SeedableAtom<boolean>
  }

const SERMON_ID = 'sermon-1'
const PLAIN_PLAYLIST_ID = 'pl-1'
const PLAIN_TITLE = 'Проповеди недели'
const LIMIT_CAPTION = `Достигнут лимит — ${MAX_CUSTOM_PLAYLIST_SERMONS} проповедей`
const SAVE_LABEL = 'Сохранить'
const CANCEL_LABEL = 'Отмена'
const NAME_LABEL = 'Название'
const CREATE_PLAYLIST_LABEL = 'Создать плейлист'
const RETURN_LABEL = 'Вернуться к списку плейлистов'
const MODAL_TITLE = 'Добавить в плейлист'
const CREATE_LABEL = 'Создать'
const NEW_PLAYLIST_TITLE = 'Проповеди на неделю'

const SERMON: SermonData = {
  artist: 'Pastor',
  artwork: null,
  audioUrl: 'https://cdn/sermon-1.mp3',
  id: SERMON_ID,
  title: 'Слово',
}

// Ids deliberately avoid SERMON_ID so a "full" playlist can be seeded without
// accidentally containing the sermon under test.
const buildSermons = (count: number): SermonData[] =>
  Array.from({ length: count }, (_, index) => ({ ...SERMON, id: `full-${index}` }))

const seedPlaylists = (
  ctx: ReturnType<typeof createCtx>,
  favoritesSermons: SermonData[],
  plainSermons: SermonData[] = [],
) => {
  myPlaylistsAtom(ctx, [
    {
      ...FAVORITES_PLAYLIST,
      sermonIds: favoritesSermons.map(sermon => sermon.id),
      sermons: favoritesSermons,
    },
    {
      id: PLAIN_PLAYLIST_ID,
      sermonIds: plainSermons.map(sermon => sermon.id),
      sermons: plainSermons,
      title: PLAIN_TITLE,
    },
  ])
}

const mockOnClose = jest.fn()

const renderModal = async (ctx: ReturnType<typeof createCtx>) =>
  renderWithProviders(
    <AddToPlaylistModal visible onClose={mockOnClose} state={{ kind: 'sermon', sermon: SERMON }} />,
    { ctx },
  )

const SOURCE_A: SermonData = { ...SERMON, id: 'source-a', title: 'Первая' }
const SOURCE_B: SermonData = { ...SERMON, id: 'source-b', title: 'Вторая' }
const SOURCE_PLAYLIST: PlaylistData = {
  artwork: null,
  id: 'source',
  sermons: [SOURCE_A, SOURCE_B],
  title: 'Источник',
}
const LIMIT_TOAST = `В плейлисте максимум ${MAX_CUSTOM_PLAYLIST_SERMONS} проповедей`

const renderAllModal = async (ctx: ReturnType<typeof createCtx>) =>
  renderWithProviders(
    <AddToPlaylistModal
      visible
      onClose={mockOnClose}
      state={{ kind: 'all', playlist: SOURCE_PLAYLIST }}
    />,
    { ctx },
  )

// Membership rows are the only buttons carrying an accessibility `checked` state
// (the footer buttons only carry `disabled`), so this isolates them from the footer.
const getRows = () =>
  screen
    .getAllByRole('button')
    .filter(button => button.props.accessibilityState?.checked !== undefined)

const getSaveButton = () => screen.getByRole('button', { name: SAVE_LABEL })

const pressRow = async (index: number) => {
  await act(async () => {
    fireEvent.press(getRows()[index])
  })
}

const pressSave = async () => {
  await act(async () => {
    fireEvent.press(getSaveButton())
  })
}

const pressCancel = async () => {
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: CANCEL_LABEL }))
  })
}

const markPlaylistsLoaded = (ctx: ReturnType<typeof createCtx>) => {
  myPlaylistsLoadedAtom(ctx, true)
}

const getCreateButton = () => screen.getByRole('button', { name: CREATE_PLAYLIST_LABEL })

const pressCreatePlaylist = async () => {
  await act(async () => {
    fireEvent.press(getCreateButton())
  })
}

const changeTitle = async (text: string) => {
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(NAME_LABEL), text)
  })
}

const pressCreateSubmit = async () => {
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: CREATE_LABEL }))
  })
}

const pressCreateCancel = async () => {
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: CANCEL_LABEL }))
  })
}

const findRowByTitle = (title: string) =>
  getRows().find(row => within(row).queryByText(title) !== null)

const pressRowByTitle = async (title: string) => {
  const row = findRowByTitle(title)
  if (!row) throw new Error(`row "${title}" was not rendered`)
  await act(async () => {
    fireEvent.press(row)
  })
}

describe('<AddToPlaylistModal>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTogglePlaylistSermon.mockReset()
    mockOnClose.mockReset()
  })

  test('renders containing playlists first with checked boxes', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })

  test('keeps not-contained playlists unchecked', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])

    await renderModal(ctx)

    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).not.toBeChecked()
  })

  test('disables save until a draft change and enables it once toggled', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)

    expect(getSaveButton()).toBeDisabled()

    await pressRow(1)
    expect(getSaveButton()).toBeEnabled()

    // Reverting the checkbox back to its initial value makes the draft pristine.
    await pressRow(1)
    expect(getSaveButton()).toBeDisabled()
  })

  test('applies membership only after save, not on the checkbox press', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    await pressRow(1)

    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()

    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][0]).toBe(ctx)
    expect(mockTogglePlaylistSermon.mock.calls[0][1]).toBe(PLAIN_PLAYLIST_ID)
    expect(mockTogglePlaylistSermon.mock.calls[0][2]).toEqual(SERMON)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(true)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('saves only the changed playlists', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    await pressRow(1)
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
  })

  test('removes membership for a contained playlist on save', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    await pressRow(0)
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][1]).toBe(FAVORITES_PLAYLIST.id)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(false)
  })

  test('cancel discards the draft and closes without entity calls', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    await pressRow(1)
    await pressCancel()

    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('backdrop press discards the draft without entity calls', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    await pressRow(1)
    await act(async () => {
      fireEvent.press(screen.getByTestId('modal-backdrop'))
    })

    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('disables and captions a full playlist the sermon is not in', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [], buildSermons(MAX_CUSTOM_PLAYLIST_SERMONS))

    await renderModal(ctx)

    expect(screen.getByText(LIMIT_CAPTION)).toBeTruthy()
    expect(getRows()[1].props.accessibilityState.disabled).toBe(true)
    expect(getSaveButton()).toBeDisabled()
  })

  test('keeps a full playlist enabled when the sermon is already a member', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON, ...buildSermons(MAX_CUSTOM_PLAYLIST_SERMONS - 1)])

    await renderModal(ctx)

    expect(screen.queryByText(LIMIT_CAPTION)).toBeNull()

    await pressRow(0)
    expect(getSaveButton()).toBeEnabled()
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(false)
  })
})

describe('<AddToPlaylistModal> batch mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTogglePlaylistSermon.mockReset()
    mockOnClose.mockReset()
  })

  test('checks a target that already contains every source sermon', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SOURCE_A, SOURCE_B])

    await renderAllModal(ctx)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
    expect(getSaveButton()).toBeDisabled()
  })

  test('disables save until a draft change and enables it once toggled', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])

    await renderAllModal(ctx)

    expect(getSaveButton()).toBeDisabled()

    await pressRow(1)
    expect(getSaveButton()).toBeEnabled()
  })

  test('toggling only drafts, no entity calls before save', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])

    await renderAllModal(ctx)
    await pressRow(1)

    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()
  })

  test('save adds only the missing source sermons as true', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SOURCE_A])

    await renderAllModal(ctx)
    await pressRow(0)
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][1]).toBe(FAVORITES_PLAYLIST.id)
    expect(mockTogglePlaylistSermon.mock.calls[0][2]).toEqual(SOURCE_B)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(true)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('stops adding on limit-reached and shows the limit toast', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])
    mockTogglePlaylistSermon.mockResolvedValue('limit-reached')

    await renderAllModal(ctx)
    await pressRow(1)
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(ctx.get(toastAtom)).toBe(LIMIT_TOAST)
  })

  test('unchecking a fully-contained target removes every source sermon', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SOURCE_A, SOURCE_B])

    await renderAllModal(ctx)
    await pressRow(0)
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(2)
    expect(mockTogglePlaylistSermon.mock.calls[0][1]).toBe(FAVORITES_PLAYLIST.id)
    expect(mockTogglePlaylistSermon.mock.calls[0][2]).toEqual(SOURCE_A)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(false)
    expect(mockTogglePlaylistSermon.mock.calls[1][2]).toEqual(SOURCE_B)
    expect(mockTogglePlaylistSermon.mock.calls[1][3]).toBe(false)
  })
})

describe('<AddToPlaylistModal> create playlist', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTogglePlaylistSermon.mockReset()
    mockOnClose.mockReset()
  })

  test('renders the create-playlist button in sermon mode', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])

    await renderModal(ctx)

    expect(getCreateButton()).toBeTruthy()
  })

  test('renders the create-playlist button in batch mode', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])

    await renderAllModal(ctx)

    expect(getCreateButton()).toBeTruthy()
  })

  test('swaps the create icon for a back-to-list icon while the form is open', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])
    markPlaylistsLoaded(ctx)

    await renderModal(ctx)
    expect(screen.getByText(MODAL_TITLE)).toBeTruthy()

    await pressCreatePlaylist()

    expect(screen.getByText(MODAL_TITLE)).toBeTruthy()
    expect(screen.queryByRole('button', { name: CREATE_PLAYLIST_LABEL })).toBeNull()

    const returnButton = screen.getByRole('button', { name: RETURN_LABEL })
    await act(async () => {
      fireEvent.press(returnButton)
    })

    expect(screen.queryByRole('button', { name: RETURN_LABEL })).toBeNull()
    expect(getCreateButton()).toBeTruthy()
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
  })

  test('switches to the inline form and back, keeping submit disabled until a title', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])
    markPlaylistsLoaded(ctx)

    await renderModal(ctx)
    await pressCreatePlaylist()

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.getByLabelText(NAME_LABEL)).toBeTruthy()
    expect(screen.getByRole('button', { name: CREATE_LABEL })).toBeDisabled()

    await pressCreateCancel()

    expect(screen.queryByLabelText(NAME_LABEL)).toBeNull()
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
  })

  test('creates a playlist from the modal and saves the sermon into it', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])
    markPlaylistsLoaded(ctx)

    await renderModal(ctx)
    await pressCreatePlaylist()
    await changeTitle(NEW_PLAYLIST_TITLE)
    await pressCreateSubmit()

    await waitFor(() => expect(screen.queryByLabelText(NAME_LABEL)).toBeNull())
    expect(screen.getByText(NEW_PLAYLIST_TITLE)).toBeTruthy()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)

    const created = ctx.get(myPlaylistsAtom).find(playlist => playlist.title === NEW_PLAYLIST_TITLE)
    if (!created) throw new Error('created playlist is missing from the atom')

    await pressRowByTitle(NEW_PLAYLIST_TITLE)
    await pressSave()

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon).toHaveBeenCalledWith(ctx, created.id, SERMON, true)
  })

  test('keeps the draft when the create form is opened and cancelled', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])
    markPlaylistsLoaded(ctx)

    await renderModal(ctx)
    await pressRow(1)
    expect(getSaveButton()).toBeEnabled()

    await pressCreatePlaylist()
    await pressCreateCancel()

    expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
    expect(getSaveButton()).toBeEnabled()
  })
})

describe('<AddToPlaylistModal> onboarding bindings', () => {
  const ROW_WRAPPER_PREFIX = 'row-wrapper-'
  const SAVE_WRAPPER_ID = 'save-wrapper'

  beforeEach(() => {
    jest.clearAllMocks()
    mockTogglePlaylistSermon.mockReset()
    mockOnClose.mockReset()
  })

  const renderBoundModal = async (
    ctx: ReturnType<typeof createCtx>,
    bindings: {
      bindControls?: (controls: AddToPlaylistControls | null) => void
      renderRowWrapper?: (row: ReactElement, playlistId: string) => ReactElement
      renderSaveWrapper?: (save: ReactElement) => ReactElement
    },
  ) =>
    renderWithProviders(
      <AddToPlaylistModal
        visible
        onClose={mockOnClose}
        state={{ kind: 'sermon', sermon: SERMON }}
        {...bindings}
      />,
      { ctx },
    )

  test('wraps every playlist row and the save button in the provided wrappers', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])
    const renderRowWrapper = jest.fn((row: ReactElement, playlistId: string) => (
      <View testID={`${ROW_WRAPPER_PREFIX}${playlistId}`}>{row}</View>
    ))
    const renderSaveWrapper = jest.fn((save: ReactElement) => (
      <View testID={SAVE_WRAPPER_ID}>{save}</View>
    ))

    await renderBoundModal(ctx, { renderRowWrapper, renderSaveWrapper })

    expect(screen.getByTestId(`${ROW_WRAPPER_PREFIX}${FAVORITES_PLAYLIST.id}`)).toBeTruthy()
    expect(screen.getByTestId(`${ROW_WRAPPER_PREFIX}${PLAIN_PLAYLIST_ID}`)).toBeTruthy()
    expect(screen.getByTestId(SAVE_WRAPPER_ID)).toBeTruthy()
  })

  test('hands setPlaylistChecked to bindControls and ticks the favorites checkbox', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])
    const bindControls = jest.fn<void, [AddToPlaylistControls | null]>()

    await renderBoundModal(ctx, { bindControls })

    const controls = bindControls.mock.calls[0][0]
    if (!controls) throw new Error('controls were not bound on mount')
    expect(getSaveButton()).toBeDisabled()

    await act(async () => {
      controls.setPlaylistChecked(FAVORITES_PLAYLIST.id, true)
    })

    expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
    expect(getSaveButton()).toBeEnabled()
  })

  test('clears the bound controls on unmount', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [])
    const bindControls = jest.fn<void, [AddToPlaylistControls | null]>()

    const { unmount } = await renderBoundModal(ctx, { bindControls })

    await act(async () => {
      unmount()
    })

    expect(bindControls).toHaveBeenLastCalledWith(null)
  })
})
