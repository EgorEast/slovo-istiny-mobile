import { createCtx } from '@reatom/framework'
import { act } from '@testing-library/react-native'
import { type PlaylistData } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { renderHookWithProviders } from 'shared/mocks'
import { useSermonPlayback } from './useSermonPlayback'

jest.mock('entities/player', () => ({
  usePlayNewSermon: () => jest.fn(),
}))

const PLAYLIST_A: PlaylistData = {
  artwork: null,
  id: 'pl-a',
  sermons: [],
  title: 'Плейлист A',
}
const PLAYLIST_B: PlaylistData = {
  artwork: null,
  id: 'pl-b',
  sermons: [],
  title: 'Плейлист B',
}
const MULTI_PLAYLIST_SERMON: SermonData = {
  artist: 'Проповедник',
  artwork: null,
  audioUrl: 'https://example.com/sermon.mp3',
  id: 'sermon-1',
  playlists: [PLAYLIST_A, PLAYLIST_B],
  title: 'Проповедь',
}

const renderPlayback = async () =>
  renderHookWithProviders(() => useSermonPlayback(), { ctx: createCtx() })

describe('useSermonPlayback', () => {
  test('opens the picker for a multi-playlist sermon and closes it on demand', async () => {
    const { result } = await renderPlayback()

    await act(async () => {
      result.current.onSermonPress(MULTI_PLAYLIST_SERMON)
    })
    expect(result.current.modal).not.toBeNull()

    await act(async () => {
      result.current.closePicker()
    })
    expect(result.current.modal).toBeNull()
  })
})
