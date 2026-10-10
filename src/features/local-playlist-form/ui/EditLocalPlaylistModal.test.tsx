import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { EditLocalPlaylistModal } from './EditLocalPlaylistModal'

const mockBack = jest.fn()
const mockRenameLocalPlaylist = jest.fn()
const mockDeleteLocalPlaylist = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }))

jest.mock('entities/playlist', () => {
  const { action } = jest.requireActual('@reatom/framework')
  return {
    deleteLocalPlaylist: action((_ctx: unknown, playlistId: unknown) => {
      mockDeleteLocalPlaylist(playlistId)
      return Promise.resolve()
    }, 'deleteLocalPlaylistMock'),
    renameLocalPlaylist: action((_ctx: unknown, playlistId: unknown, title: unknown) => {
      mockRenameLocalPlaylist(playlistId, title)
      return Promise.resolve()
    }, 'renameLocalPlaylistMock'),
  }
})

const NAME_LABEL = 'Название'
const SAVE_LABEL = 'Сохранить'
const DELETE_LABEL = 'Удалить'
const DELETE_TITLE = 'Удалить плейлист?'

const renderModal = (onClose: () => void) =>
  renderWithProviders(
    <EditLocalPlaylistModal visible onClose={onClose} playlistId='local-1' currentTitle='Старое' />,
  )

const changeTitle = async (text: string) => {
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(NAME_LABEL), text)
  })
}

const press = async (target: Parameters<typeof fireEvent.press>[0]) => {
  await act(async () => {
    fireEvent.press(target)
  })
}

describe('<EditLocalPlaylistModal>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renames the playlist with the trimmed title and closes', async () => {
    const onClose = jest.fn()
    await renderModal(onClose)

    expect(screen.getByLabelText(NAME_LABEL).props.value).toBe('Старое')

    await changeTitle('  Новое  ')
    await press(screen.getByText(SAVE_LABEL))

    await waitFor(() => expect(mockRenameLocalPlaylist).toHaveBeenCalledWith('local-1', 'Новое'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('does not rename while the title is unchanged', async () => {
    await renderModal(jest.fn())

    await press(screen.getByText(SAVE_LABEL))

    expect(mockRenameLocalPlaylist).not.toHaveBeenCalled()
  })

  test('renames on Enter from the title field', async () => {
    const onClose = jest.fn()
    await renderModal(onClose)

    await changeTitle('Новое')
    await act(async () => {
      fireEvent(screen.getByLabelText(NAME_LABEL), 'submitEditing')
    })

    await waitFor(() => expect(mockRenameLocalPlaylist).toHaveBeenCalledWith('local-1', 'Новое'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('deletes the playlist only after the confirmation', async () => {
    const onClose = jest.fn()
    await renderModal(onClose)

    await press(screen.getByLabelText(DELETE_LABEL))
    expect(screen.getByText(DELETE_TITLE)).toBeTruthy()
    expect(mockDeleteLocalPlaylist).not.toHaveBeenCalled()

    const confirmButtons = screen.getAllByText(DELETE_LABEL)
    await press(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => expect(mockDeleteLocalPlaylist).toHaveBeenCalledWith('local-1'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})
