import { act } from '@testing-library/react-native'
import { deriveCustomPlaylistId, packSermonIds } from 'entities/playlist'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { useCustomPlaylistImport } from './useCustomPlaylistImport'

const mockReplace = jest.fn()
const mockSetParams = jest.fn()
const mockLoad = jest.fn()
const mockCreate = jest.fn()
const mockShowToast = jest.fn()
let mockLoadedPlaylists: unknown[] = []
let mockParams: {
  custom?: null | string
  playlist?: string
  sermons?: string
  title?: string
} = {}

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ replace: mockReplace, setParams: mockSetParams }),
}))

jest.mock('entities/playlist', () => {
  const { action } = jest.requireActual('@reatom/framework')
  const actual = jest.requireActual('entities/playlist')
  return {
    ...actual,
    createLocalPlaylist: action((_ctx: unknown, input: { id: string }) => {
      mockCreate(input)
      return Promise.resolve({ id: input.id })
    }, 'createLocalPlaylistMock'),
    loadMyPlaylists: action(() => {
      mockLoad()
      return Promise.resolve(mockLoadedPlaylists)
    }, 'loadMyPlaylistsMock'),
  }
})

jest.mock('shared/model', () => {
  const { action } = jest.requireActual('@reatom/framework')
  return {
    ...jest.requireActual('shared/model'),
    showToast: action((_ctx: unknown, message: unknown) => {
      mockShowToast(message)
    }, 'showToastMock'),
  }
})

const IMPORT_TITLE = 'Импорт'

describe('useCustomPlaylistImport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLoadedPlaylists = []
    mockParams = {}
  })

  test('hydrates playlists before creating, then replaces the route', async () => {
    mockParams = { custom: null, sermons: 's1', title: IMPORT_TITLE }
    const id = deriveCustomPlaylistId({ sermonIds: ['s1'], title: IMPORT_TITLE })

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockLoad).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({ id, sermonIds: ['s1'], title: IMPORT_TITLE })
    expect(mockLoad.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreate.mock.invocationCallOrder[0],
    )
    expect(mockReplace).toHaveBeenCalledWith({
      params: { playlist: id },
      pathname: '/listen/playlist',
    })
  })

  test('lets a custom link win over a stale playlist param', async () => {
    mockParams = { custom: null, playlist: 'server-1', sermons: 's1', title: IMPORT_TITLE }
    const id = deriveCustomPlaylistId({ sermonIds: ['s1'], title: IMPORT_TITLE })

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockCreate).toHaveBeenCalledWith({ id, sermonIds: ['s1'], title: IMPORT_TITLE })
  })

  test('reuses the playlist of the same link instead of duplicating it', async () => {
    mockParams = { custom: null, sermons: 'b,a', title: IMPORT_TITLE }
    const id = deriveCustomPlaylistId({ sermonIds: ['b', 'a'], title: IMPORT_TITLE })
    mockLoadedPlaylists = [
      { id: 'favorites', sermonIds: [], sermons: [], title: 'Избранные' },
      { id, sermonIds: ['b', 'a'], sermons: [], title: IMPORT_TITLE },
    ]

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith({
      params: { playlist: id },
      pathname: '/listen/playlist',
    })
  })

  test('creates a new playlist when only a same-content playlist with another id exists', async () => {
    mockParams = { custom: null, sermons: 'b,a', title: IMPORT_TITLE }
    const id = deriveCustomPlaylistId({ sermonIds: ['b', 'a'], title: IMPORT_TITLE })
    mockLoadedPlaylists = [
      { id: 'favorites', sermonIds: [], sermons: [], title: 'Избранные' },
      { id: 'local-uuid', sermonIds: ['b', 'a'], sermons: [], title: IMPORT_TITLE },
    ]

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockCreate).toHaveBeenCalledWith({ id, sermonIds: ['b', 'a'], title: IMPORT_TITLE })
  })

  test('shows a toast and clears an invalid link', async () => {
    mockParams = { custom: null, sermons: 's1', title: '   ' }

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockShowToast).toHaveBeenCalledTimes(1)
    expect(mockSetParams).toHaveBeenCalledWith({
      custom: undefined,
      sermons: undefined,
      title: undefined,
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  test('does nothing when there is no custom marker', async () => {
    mockParams = { playlist: 'server-1' }

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockLoad).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('imports a playlist from the packed sermon ids form', async () => {
    const ids = ['0f0e8d6c-1a2b-4c3d-9e8f-001122334455', '11111111-2222-4333-8444-555555555555']
    mockParams = { custom: null, sermons: packSermonIds(ids) ?? '', title: IMPORT_TITLE }
    const id = deriveCustomPlaylistId({ sermonIds: ids, title: IMPORT_TITLE })

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockCreate).toHaveBeenCalledWith({ id, sermonIds: ids, title: IMPORT_TITLE })
  })

  test('treats a link with more ids than the maximum as invalid', async () => {
    const ids = Array.from(
      { length: 201 },
      (_, index) => `${index.toString(16).padStart(8, '0')}-0000-4000-8000-000000000000`,
    )
    mockParams = { custom: null, sermons: packSermonIds(ids) ?? '', title: IMPORT_TITLE }

    await renderHookWithProviders(() => useCustomPlaylistImport())
    await act(async () => {})

    expect(mockShowToast).toHaveBeenCalledTimes(1)
    expect(mockSetParams).toHaveBeenCalledWith({
      custom: undefined,
      sermons: undefined,
      title: undefined,
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
