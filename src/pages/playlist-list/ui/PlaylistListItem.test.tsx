import { fireEvent } from '@testing-library/react-native'
import { type PlaylistData } from 'entities/playlist'
import { renderWithProviders } from 'shared/mocks'
import { ALBUM_ART_SIZE, PlaylistListItem } from './PlaylistListItem'

const mockLetterAvatar = jest.fn()

jest.mock('shared/ui', () => {
  const { View } = jest.requireActual('react-native')

  return {
    CoverImage: () => <View />,
    PlaylistLetterAvatar: (props: { size: number; title: string }) => {
      mockLetterAvatar(props)
      return <View />
    },
  }
})

const PLAYLIST_TITLE = 'Плейлист о вере'
const PLAYLIST_DESCRIPTION = 'Описание плейлиста'
const PLAYLIST_ARTWORK = 'https://example.test/cover.jpg'
const LONG_PLAYLIST_TITLE = 'Очень длинное название плейлиста '.repeat(5)

const makePlaylist = (overrides: Partial<PlaylistData> = {}): PlaylistData => ({
  artwork: null,
  id: 'playlist-1',
  sermons: [],
  title: PLAYLIST_TITLE,
  ...overrides,
})

describe('<PlaylistListItem>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders the playlist title', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistListItem onPress={jest.fn()} playlist={makePlaylist()} />,
    )

    expect(getByText(PLAYLIST_TITLE)).toBeTruthy()
  })

  test('renders a long multiline title fully', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistListItem
        onPress={jest.fn()}
        playlist={makePlaylist({ title: LONG_PLAYLIST_TITLE })}
      />,
    )

    expect(getByText(LONG_PLAYLIST_TITLE)).toBeTruthy()
  })

  test('renders the description when present', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistListItem
        onPress={jest.fn()}
        playlist={makePlaylist({ description: PLAYLIST_DESCRIPTION })}
      />,
    )

    expect(getByText(PLAYLIST_DESCRIPTION)).toBeTruthy()
  })

  test('does not render the description when absent', async () => {
    const { queryByText } = await renderWithProviders(
      <PlaylistListItem onPress={jest.fn()} playlist={makePlaylist()} />,
    )

    expect(queryByText(PLAYLIST_DESCRIPTION)).toBeNull()
  })

  test('renders the letter tile at the standard artwork size when artwork is absent', async () => {
    await renderWithProviders(<PlaylistListItem onPress={jest.fn()} playlist={makePlaylist()} />)

    expect(mockLetterAvatar).toHaveBeenCalledWith({ size: ALBUM_ART_SIZE, title: PLAYLIST_TITLE })
  })

  test('does not render the letter tile when artwork is present', async () => {
    await renderWithProviders(
      <PlaylistListItem
        onPress={jest.fn()}
        playlist={makePlaylist({ artwork: PLAYLIST_ARTWORK })}
      />,
    )

    expect(mockLetterAvatar).not.toHaveBeenCalled()
  })

  test('fires onPress when the row is pressed', async () => {
    const onPress = jest.fn()
    const { getByText } = await renderWithProviders(
      <PlaylistListItem onPress={onPress} playlist={makePlaylist()} />,
    )

    fireEvent.press(getByText(PLAYLIST_TITLE))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
