import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { CreateLocalPlaylistModal } from './CreateLocalPlaylistModal'

const mockPush = jest.fn()
const mockCreateLocalPlaylist = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }))

jest.mock('entities/playlist/createLocalPlaylist', () => {
  const { action } = jest.requireActual('@reatom/framework')
  return {
    createLocalPlaylist: action((_ctx: unknown, input: unknown) => {
      mockCreateLocalPlaylist(input)
      return Promise.resolve({ id: 'new-id' })
    }, 'createLocalPlaylistMock'),
  }
})

jest.mock('entities/playlist/model', () => {
  const { action, atom } = jest.requireActual('@reatom/framework')
  const actual = jest.requireActual('entities/playlist/model')
  return {
    ...actual,
    loadMyPlaylists: action(() => Promise.resolve([]), 'loadMyPlaylistsMock'),
    myPlaylistsLoadedAtom: atom(true, 'myPlaylistsLoadedAtomMock'),
  }
})

const NAME_LABEL = 'Название'
const SUBMIT_LABEL = 'Создать'

const changeTitle = async (text: string) => {
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(NAME_LABEL), text)
  })
}

const pressSubmit = async () => {
  await act(async () => {
    fireEvent.press(screen.getByText(SUBMIT_LABEL))
  })
}

describe('<CreateLocalPlaylistModal>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates a trimmed playlist, closes the form and navigates to it', async () => {
    const onClose = jest.fn()
    await renderWithProviders(<CreateLocalPlaylistModal visible onClose={onClose} />)

    await changeTitle('  Мой плейлист  ')
    await pressSubmit()

    await waitFor(() => expect(mockCreateLocalPlaylist).toHaveBeenCalledTimes(1))
    expect(mockCreateLocalPlaylist).toHaveBeenCalledWith({ sermonIds: [], title: 'Мой плейлист' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith({
      params: { playlist: 'new-id' },
      pathname: '/listen/playlist',
    })
  })

  test('does not submit while the title is blank', async () => {
    await renderWithProviders(<CreateLocalPlaylistModal visible onClose={jest.fn()} />)

    await changeTitle('   ')
    await pressSubmit()

    expect(mockCreateLocalPlaylist).not.toHaveBeenCalled()
  })

  test('submits on Enter from the title field', async () => {
    const onClose = jest.fn()
    await renderWithProviders(<CreateLocalPlaylistModal visible onClose={onClose} />)

    await changeTitle('Мой плейлист')
    await act(async () => {
      fireEvent(screen.getByLabelText(NAME_LABEL), 'submitEditing')
    })

    await waitFor(() => expect(mockCreateLocalPlaylist).toHaveBeenCalledTimes(1))
    expect(mockCreateLocalPlaylist).toHaveBeenCalledWith({ sermonIds: [], title: 'Мой плейлист' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('does not render the form while hidden', async () => {
    await renderWithProviders(<CreateLocalPlaylistModal visible={false} onClose={jest.fn()} />)

    expect(screen.queryByLabelText(NAME_LABEL)).toBeNull()
  })
})
