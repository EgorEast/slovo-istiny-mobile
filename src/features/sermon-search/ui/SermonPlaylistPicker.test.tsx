import { screen } from '@testing-library/react-native'
import { type ReactElement } from 'react'
import { Text, View } from 'react-native'
import { type PlaylistData } from 'entities/playlist'
import { renderWithProviders } from 'shared/mocks'
import { SermonPlaylistPicker } from './SermonPlaylistPicker'

const TITLE = 'Выберите плейлист'
const WRAPPER_MARKER = 'wrapped-dialog'
const PLAYLIST: PlaylistData = { artwork: null, id: 'playlist-1', sermons: [], title: 'Плейлист' }

const renderPicker = (containerWrapper?: (dialog: ReactElement) => ReactElement) =>
  renderWithProviders(
    <SermonPlaylistPicker
      visible
      onClose={jest.fn()}
      onSelect={jest.fn()}
      playlists={[PLAYLIST]}
      containerWrapper={containerWrapper}
    />,
  )

describe('<SermonPlaylistPicker>', () => {
  test('renders the dialog bare without a wrapper', async () => {
    await renderPicker()

    expect(screen.getByText(TITLE)).toBeTruthy()
    expect(screen.getByText(PLAYLIST.title)).toBeTruthy()
  })

  test('wraps the dialog with the page-owned container wrapper', async () => {
    const containerWrapper = jest.fn((dialog: ReactElement) => (
      <View>
        <Text>{WRAPPER_MARKER}</Text>
        {dialog}
      </View>
    ))

    await renderPicker(containerWrapper)

    expect(containerWrapper).toHaveBeenCalledTimes(1)
    expect(screen.getByText(WRAPPER_MARKER)).toBeTruthy()
    expect(screen.getByText(TITLE)).toBeTruthy()
  })
})
