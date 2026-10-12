import { createCtx } from '@reatom/framework'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { type SermonData } from 'entities/sermon'
import { renderWithProviders } from 'shared/mocks/renderWithProviders'
import { AddToPlaylistModal } from './AddToPlaylistModal'

const mockTogglePlaylistSermon = jest.fn()

// eslint-disable-next-line sonarjs/no-duplicate-string -- module id is unavoidable here
jest.mock('entities/playlist', () => {
  const actual = jest.requireActual('entities/playlist')
  return {
    ...actual,
    togglePlaylistSermon: (...args: unknown[]) => mockTogglePlaylistSermon(...args),
  }
})

const { FAVORITES_PLAYLIST, MAX_CUSTOM_PLAYLIST_SERMONS, myPlaylistsAtom } = jest.requireActual(
  'entities/playlist',
) as {
  FAVORITES_PLAYLIST: { id: string; sermonIds: string[]; sermons: unknown[]; title: string }
  MAX_CUSTOM_PLAYLIST_SERMONS: number
  myPlaylistsAtom: (ctx: unknown, value: unknown) => void
}

const SERMON_ID = 'sermon-1'
const PLAIN_PLAYLIST_ID = 'pl-1'
const PLAIN_TITLE = 'Проповеди недели'
const LIMIT_CAPTION = `Достигнут лимит — ${MAX_CUSTOM_PLAYLIST_SERMONS} проповедей`
const SAVE_LABEL = 'Сохранить'
const CANCEL_LABEL = 'Отмена'

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
  renderWithProviders(<AddToPlaylistModal visible sermon={SERMON} onClose={mockOnClose} />, { ctx })

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
