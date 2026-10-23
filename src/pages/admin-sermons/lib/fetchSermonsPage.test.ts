import { fetchSermonsPage } from './fetchSermonsPage'

const mockFindAll = jest.fn()

jest.mock('shared/api', () => ({
  sermonsApi: { getSermons: () => ({ sermonControllerFindAll: mockFindAll }) },
}))

describe('fetchSermonsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindAll.mockResolvedValue({ count: 0, nextCursor: null, sermons: [] })
  })

  test('trims the search query', async () => {
    await fetchSermonsPage('  вера  ', 'date', 'desc', 1)

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'вера' }))
  })

  test('does not send a blank search: the server requires at least one character', async () => {
    await fetchSermonsPage('   ', 'date', 'desc', 1)

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ search: undefined }))
  })
})
