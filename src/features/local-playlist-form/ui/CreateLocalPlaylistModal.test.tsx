import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { CreateLocalPlaylistModal } from './CreateLocalPlaylistModal'

const mockPush = jest.fn()
const mockCreateLocalPlaylist = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }))

jest.mock('entities/playlist/createLocalPlaylist', () => {
  const { action } = jest.requireActual('@reatom/framework')
  return {
    createLocalPlaylist: action(
      (_ctx: unknown, input: unknown) => mockCreateLocalPlaylist(input),
      'createLocalPlaylistMock',
    ),
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

const createDeferred = () => {
  let resolve: (created: { id: string }) => void = () => undefined
  const promise = new Promise<{ id: string }>(r => {
    resolve = r
  })
  return { promise, resolve }
}

const getSubmitButton = () => screen.getByRole('button', { name: SUBMIT_LABEL })

const changeTitle = async (text: string) => {
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(NAME_LABEL), text)
  })
}

const pressSubmit = async () => {
  await act(async () => {
    fireEvent.press(getSubmitButton())
  })
}

describe('<CreateLocalPlaylistModal>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateLocalPlaylist.mockResolvedValue({ id: 'new-id' })
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

  test('marks the submit button disabled while a create is in flight', async () => {
    const deferred = createDeferred()
    mockCreateLocalPlaylist.mockImplementationOnce(() => deferred.promise)
    const onClose = jest.fn()
    await renderWithProviders(<CreateLocalPlaylistModal visible onClose={onClose} />)

    await changeTitle('Мой плейлист')
    await pressSubmit()

    expect(getSubmitButton()).toBeDisabled()

    await act(async () => {
      deferred.resolve({ id: 'new-id' })
    })

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
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
