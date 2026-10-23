import { act } from '@testing-library/react-native'
import { playlistsMocks } from 'shared/api/generated'
import { renderHookWithProviders } from 'shared/mocks'
import { useSetArtworkFromPlaylist } from './useSetArtworkFromPlaylist'

const mockUpdate = jest.fn()

jest.mock('shared/api', () => ({
  sermonsApi: { getSermons: () => ({ sermonControllerUpdate: mockUpdate }) },
}))

const buildPlaylist = () => {
  const playlist = playlistsMocks.getPlaylistControllerFindOneResponseMock()
  const [sermon] = playlist.sermons
  // Legacy rows may carry '' instead of null; the PATCH body must not forward it.
  sermon.audioUrl = ''
  sermon.textFileUrl = ''
  sermon.youtubeUrl = ''

  return { playlist, sermon }
}

describe('useSetArtworkFromPlaylist', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('normalizes empty nullable urls to null in the patch body', async () => {
    const { playlist, sermon } = buildPlaylist()
    mockUpdate.mockResolvedValue(sermon)
    const refresh = jest.fn().mockResolvedValue(undefined)

    const { result } = await renderHookWithProviders(() =>
      useSetArtworkFromPlaylist({ playlist, refresh, sermons: [sermon] }),
    )

    await act(async () => {
      await result.current.confirm()
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      sermon.id,
      expect.objectContaining({
        artwork: playlist.artwork,
        audioUrl: null,
        textFileUrl: null,
        youtubeUrl: null,
      }),
    )
    expect(refresh).toHaveBeenCalled()
  })
})
