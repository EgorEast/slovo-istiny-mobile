import { createCtx } from '@reatom/framework'
import { act, fireEvent } from '@testing-library/react-native'
import {
  DEFAULT_SECTION_SETTINGS,
  FAVORITES_PLAYLIST,
  type LocalPlaylistData,
  myPlaylistsAtom,
  sectionSettingsAtom,
} from 'entities/playlist'
import { renderWithProviders } from 'shared/mocks'
import { MyPlaylistsSlider } from './MyPlaylistsSlider'

const mockPush = jest.fn()
const mockLoadMyPlaylists = jest.fn()
const mockLoadSectionSettings = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// The section fires loadMyPlaylists/loadSectionSettings on mount; a real storage
// read would clobber the atom seeded per test. Replace them with reatom actions
// that record the call and raise the loaded flag, so tests own the atom while the
// remount guard can be exercised.
jest.mock('entities/playlist', () => {
  const { action } = jest.requireActual('@reatom/framework')
  const actual = jest.requireActual('entities/playlist')

  return {
    ...actual,
    loadMyPlaylists: action((ctx: unknown) => {
      mockLoadMyPlaylists()
      actual.myPlaylistsLoadedAtom(ctx, true)
      return Promise.resolve([])
    }, 'loadMyPlaylistsMock'),
    loadSectionSettings: action((ctx: unknown) => {
      mockLoadSectionSettings()
      actual.sectionSettingsLoadedAtom(ctx, true)
      return Promise.resolve()
    }, 'loadSectionSettingsMock'),
  }
})

jest.mock('@expo/vector-icons', () => {
  const { Text } = jest.requireActual('react-native')

  return {
    Entypo: (props: { name: string }) => <Text>{props.name}</Text>,
    Ionicons: (props: { name: string }) => <Text>{props.name}</Text>,
  }
})

const PLAYLIST_A_TITLE = 'Плейлист A'
const PLAYLIST_B_TITLE = 'Плейлист B'
const EDIT_LABEL = 'Изменить порядок'
const SAVE_LABEL = 'Сохранить'
const SECTION_TITLE = 'Мои плейлисты'
const CREATE_TITLE = 'Создать'
const FAVORITES_TITLE = FAVORITES_PLAYLIST.title
const TITLE_ON_CARD_TEST_ID = 'slider-item-title-on-card'

const PLAYLIST_A: LocalPlaylistData = {
  id: 'a',
  sermonIds: [],
  sermons: [],
  title: PLAYLIST_A_TITLE,
}
const PLAYLIST_B: LocalPlaylistData = {
  id: 'b',
  sermonIds: [],
  sermons: [],
  title: PLAYLIST_B_TITLE,
}

const seedPlaylists = (ctx: ReturnType<typeof createCtx>) =>
  myPlaylistsAtom(ctx, [FAVORITES_PLAYLIST, PLAYLIST_A, PLAYLIST_B])

describe('<MyPlaylistsSlider>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders the favorites card first and the local playlists', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { getAllByText, getByLabelText, getByText } = await renderWithProviders(
      <MyPlaylistsSlider />,
      { ctx },
    )

    expect(getByLabelText(SECTION_TITLE)).toBeTruthy()
    expect(getByText('heart')).toBeTruthy()
    expect(getAllByText(FAVORITES_TITLE)[0]).toBeTruthy()
    expect(getAllByText(PLAYLIST_A_TITLE)[0]).toBeTruthy()
    expect(getAllByText(PLAYLIST_B_TITLE)[0]).toBeTruthy()
  })

  test('has no edit affordances on the slider', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { queryByLabelText } = await renderWithProviders(<MyPlaylistsSlider />, { ctx })

    expect(queryByLabelText(EDIT_LABEL)).toBeNull()
    expect(queryByLabelText(SAVE_LABEL)).toBeNull()
  })

  test('navigates to the my-playlists screen when the title is pressed', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { getByLabelText } = await renderWithProviders(<MyPlaylistsSlider />, { ctx })

    fireEvent.press(getByLabelText(SECTION_TITLE))

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/listen/my-playlists' }),
    )
  })

  test('navigates to the playlist on a card tap', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { getAllByText } = await renderWithProviders(<MyPlaylistsSlider />, { ctx })

    fireEvent.press(getAllByText(PLAYLIST_A_TITLE)[0])

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ params: { playlist: 'a' } }))
  })

  test('navigates to the favorites playlist on the heart card tap', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { getAllByText } = await renderWithProviders(<MyPlaylistsSlider />, { ctx })

    fireEvent.press(getAllByText(FAVORITES_TITLE)[0])

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ params: { playlist: FAVORITES_PLAYLIST.id } }),
    )
  })

  test('renders the card titles under the cards for the default title location', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { getAllByText, queryAllByTestId } = await renderWithProviders(<MyPlaylistsSlider />, {
      ctx,
    })

    expect(getAllByText(PLAYLIST_A_TITLE)[0]).toBeTruthy()
    expect(queryAllByTestId(TITLE_ON_CARD_TEST_ID)).toHaveLength(0)
  })

  test('still renders cards when borderRadius is off', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)
    sectionSettingsAtom(ctx, { ...DEFAULT_SECTION_SETTINGS, borderRadius: false })

    const { getAllByText } = await renderWithProviders(<MyPlaylistsSlider />, { ctx })

    expect(getAllByText(PLAYLIST_A_TITLE)[0]).toBeTruthy()
  })

  test('maps the configured title location to the on-card title', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)
    sectionSettingsAtom(ctx, {
      borderRadius: false,
      isDescriptionTitleOnSlideLarge: false,
      itemsRows: null,
      itemsSize: 'small',
      transform: 'middle',
      whereIsSlideTitleLocated: 'on',
    })

    const { getAllByTestId } = await renderWithProviders(<MyPlaylistsSlider />, {
      ctx,
    })

    expect(getAllByTestId(TITLE_ON_CARD_TEST_ID).length).toBeGreaterThan(0)
  })

  test('renders a trailing create card that opens the create form on tap', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { getAllByText, getByLabelText } = await renderWithProviders(<MyPlaylistsSlider />, {
      ctx,
    })

    expect(getAllByText(CREATE_TITLE).length).toBeGreaterThan(0)

    await act(async () => {
      fireEvent.press(getAllByText(CREATE_TITLE)[0])
    })

    expect(getByLabelText('Название')).toBeTruthy()
  })

  test('loads playlists and settings once on first mount', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    await renderWithProviders(<MyPlaylistsSlider />, { ctx })

    expect(mockLoadMyPlaylists).toHaveBeenCalledTimes(1)
    expect(mockLoadSectionSettings).toHaveBeenCalledTimes(1)
  })

  test('does not reload on remount after a successful load', async () => {
    const ctx = createCtx()
    seedPlaylists(ctx)

    const { rerender } = await renderWithProviders(<MyPlaylistsSlider key='first' />, { ctx })
    await rerender(<MyPlaylistsSlider key='second' />)

    expect(mockLoadMyPlaylists).toHaveBeenCalledTimes(1)
    expect(mockLoadSectionSettings).toHaveBeenCalledTimes(1)
  })
})
