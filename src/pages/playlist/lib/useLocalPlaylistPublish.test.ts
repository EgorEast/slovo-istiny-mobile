import { createCtx } from '@reatom/framework'
import { act } from '@testing-library/react-native'
import { authUserAtom } from 'entities/auth'
import {
  FAVORITES_PLAYLIST,
  type LocalPlaylistData,
  myPlaylistsAtom,
  type PlaylistData,
} from 'entities/playlist'
import { usersMocks } from 'shared/api/generated'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { useLocalPlaylistPublish } from './useLocalPlaylistPublish'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }))

const LOCAL_PLAYLIST: LocalPlaylistData = {
  id: 'local-1',
  sermonIds: ['s1', 's2'],
  sermons: [{ artist: 'A1', artwork: null, id: 's1', title: 'S1' }],
  title: 'Мой',
}

const PLAYLIST_DATA: PlaylistData = {
  artwork: null,
  description: '',
  id: 'local-1',
  sermons: [],
  title: 'Мой',
}

const ADMIN = usersMocks.getUsersControllerFindOneResponseMock({ role: 'admin' })

describe('useLocalPlaylistPublish', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('is publishable only with an admin session, and passes sermon snapshots', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [FAVORITES_PLAYLIST, LOCAL_PLAYLIST])
    const onClose = jest.fn()

    const { result } = await renderHookWithProviders(
      () => useLocalPlaylistPublish(PLAYLIST_DATA, onClose),
      { ctx },
    )

    expect(result.current.isLocalPlaylist).toBe(true)
    expect(result.current.canPublish).toBe(false)

    await act(async () => {
      authUserAtom(ctx, ADMIN)
    })
    expect(result.current.canPublish).toBe(true)

    result.current.handlePublish()

    expect(mockPush).toHaveBeenCalledWith({
      params: {
        sermonIds: 's1,s2',
        sermons: JSON.stringify([
          { artist: 'A1', artwork: null, id: 's1', title: 'S1' },
          { id: 's2' },
        ]),
        title: 'Мой',
      },
      pathname: '/admin/playlists/create',
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('never treats favorites as a publishable local playlist', async () => {
    const ctx = createCtx()
    myPlaylistsAtom(ctx, [FAVORITES_PLAYLIST])

    const { result } = await renderHookWithProviders(
      () =>
        useLocalPlaylistPublish(
          {
            artwork: null,
            description: '',
            id: FAVORITES_PLAYLIST.id,
            sermons: [],
            title: 'Избранные',
          },
          jest.fn(),
        ),
      { ctx },
    )

    expect(result.current.isLocalPlaylist).toBe(false)
    expect(result.current.canPublish).toBe(false)
  })
})
