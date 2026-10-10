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
const PLAIN_TITLE = 'Проповеди недели'
const LIMIT_CAPTION = `Достигнут лимит — ${MAX_CUSTOM_PLAYLIST_SERMONS} проповедей`

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
      id: 'pl-1',
      sermonIds: plainSermons.map(sermon => sermon.id),
      sermons: plainSermons,
      title: PLAIN_TITLE,
    },
  ])
}

const renderModal = async (ctx: ReturnType<typeof createCtx>) =>
  renderWithProviders(<AddToPlaylistModal visible sermon={SERMON} onClose={jest.fn()} />, { ctx })

const pressMembershipRow = (index: number) => {
  const rows = screen.getAllByRole('button').filter(button => button.props.accessibilityState)
  fireEvent.press(rows[index])
}

describe('<AddToPlaylistModal>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTogglePlaylistSermon.mockReset()
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

  test('adds membership via the entity action when a plain row is pressed', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    pressMembershipRow(1)

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][1]).toBe('pl-1')
    expect(mockTogglePlaylistSermon.mock.calls[0][2]).toEqual(SERMON)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(true)
  })

  test('removes membership for a contained playlist', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    pressMembershipRow(0)

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(false)
  })

  test('toggles exactly once when the checkbox itself is pressed', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON])

    await renderModal(ctx)
    // Row order is contained-first: index 1 is the not-contained `pl-1`.
    await fireEvent.press(screen.getAllByRole('checkbox')[1])

    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][1]).toBe('pl-1')
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(true)
  })

  test('disables and captions a full playlist the sermon is not in', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [], buildSermons(MAX_CUSTOM_PLAYLIST_SERMONS))

    await renderModal(ctx)

    expect(screen.getByText(LIMIT_CAPTION)).toBeTruthy()
    const rows = screen.getAllByRole('button').filter(button => button.props.accessibilityState)
    expect(rows[1].props.accessibilityState.disabled).toBe(true)

    await act(async () => {
      pressMembershipRow(1)
    })
    expect(mockTogglePlaylistSermon).not.toHaveBeenCalled()
  })

  test('keeps a full playlist enabled when the sermon is already a member', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx, [SERMON, ...buildSermons(MAX_CUSTOM_PLAYLIST_SERMONS - 1)])

    await renderModal(ctx)

    expect(screen.queryByText(LIMIT_CAPTION)).toBeNull()

    await act(async () => {
      pressMembershipRow(0)
    })
    expect(mockTogglePlaylistSermon).toHaveBeenCalledTimes(1)
    expect(mockTogglePlaylistSermon.mock.calls[0][3]).toBe(false)
  })
})
