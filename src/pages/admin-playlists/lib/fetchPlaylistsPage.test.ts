import { fetchPlaylistsPage } from './fetchPlaylistsPage'

const mockFindAll = jest.fn()

jest.mock('shared/api', () => ({
  playlistsApi: { getPlaylists: () => ({ playlistControllerFindAll: mockFindAll }) },
}))

describe('fetchPlaylistsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindAll.mockResolvedValue({ count: 0, playlists: [] })
  })

  test('trims the search query', async () => {
    await fetchPlaylistsPage('  вера  ', 'date', 'desc', 1)

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'вера' }))
  })

  test('does not send a blank search: the server requires at least one character', async () => {
    await fetchPlaylistsPage('   ', 'date', 'desc', 1)

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ search: undefined }))
  })
})
