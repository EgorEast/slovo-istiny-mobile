import { fireEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import { type PlaylistListItemData } from '../model'
import { PlaylistList } from './PlaylistList'

jest.mock('shared/ui/collapsing-navbar-driver', () => ({
  useCollapsingNavbarDriver: jest.fn(() => ({ headerBgOpacity: 0 })),
}))

jest.mock('../lib/useCollapsingHeader', () => ({
  TITLE_TOP_GAP: 80,
  useCollapsingHeader: () => ({
    darkenStart: { value: 0 },
    headerHeight: 100,
    onTitleLayout: jest.fn(),
    scrollHandler: jest.fn(),
    scrollY: { value: 0 },
    titleAppearThreshold: { value: Number.MAX_SAFE_INTEGER },
  }),
}))

jest.mock('shared/ui', () => {
  const { View } = jest.requireActual('react-native')

  return {
    CoverImage: () => <View />,
    PlaylistLetterAvatar: () => <View />,
  }
})

const TITLE = 'Раздел проповедей'
const PLAYLIST_A_TITLE = 'Плейлист о вере'
const PLAYLIST_B_TITLE = 'Плейлист о любви'
const EMPTY_TEXT = 'Нет плейлистов'
const FOOTER_TEXT = 'Создать плейлист'

const makeItem = (id: string, title: string): PlaylistListItemData => ({
  artwork: null,
  id,
  title,
})

describe('<PlaylistList>', () => {
  test('renders the title and the playlist rows', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistList
        title={TITLE}
        onPressPlaylist={jest.fn()}
        playlists={[makeItem('a', PLAYLIST_A_TITLE), makeItem('b', PLAYLIST_B_TITLE)]}
      />,
    )

    expect(getByText(TITLE)).toBeTruthy()
    expect(getByText(PLAYLIST_A_TITLE)).toBeTruthy()
    expect(getByText(PLAYLIST_B_TITLE)).toBeTruthy()
  })

  test('fires onPressPlaylist with the pressed item', async () => {
    const onPressPlaylist = jest.fn()
    const item = makeItem('a', PLAYLIST_A_TITLE)

    const { getByText } = await renderWithProviders(
      <PlaylistList title={TITLE} playlists={[item]} onPressPlaylist={onPressPlaylist} />,
    )

    fireEvent.press(getByText(PLAYLIST_A_TITLE))

    expect(onPressPlaylist).toHaveBeenCalledWith(item)
  })

  test('shows the empty text when there are no playlists', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistList title={TITLE} playlists={[]} onPressPlaylist={jest.fn()} />,
    )

    expect(getByText(EMPTY_TEXT)).toBeTruthy()
  })

  test('renders the footer below the rows', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistList
        title={TITLE}
        onPressPlaylist={jest.fn()}
        listFooter={<Text>{FOOTER_TEXT}</Text>}
        playlists={[makeItem('a', PLAYLIST_A_TITLE)]}
      />,
    )

    expect(getByText(FOOTER_TEXT)).toBeTruthy()
  })
})
