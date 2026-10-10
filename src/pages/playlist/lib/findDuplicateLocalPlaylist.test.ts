import { FAVORITES_PLAYLIST, type LocalPlaylistData } from 'entities/playlist'
import { findDuplicateLocalPlaylist } from './findDuplicateLocalPlaylist'

const playlist = (id: string, title: string, sermonIds: string[]): LocalPlaylistData => ({
  id,
  sermonIds,
  sermons: [],
  title,
})

describe('findDuplicateLocalPlaylist', () => {
  test('matches on title and identical sermon-id set regardless of order', () => {
    const playlists = [
      FAVORITES_PLAYLIST,
      playlist('local-1', 'Проповеди', ['a', 'b']),
      playlist('local-2', 'Другое', ['a']),
    ]

    const found = findDuplicateLocalPlaylist(playlists, {
      sermonIds: ['b', 'a'],
      title: 'Проповеди',
    })

    expect(found?.id).toBe('local-1')
  })

  test('returns undefined when the title differs', () => {
    const playlists = [playlist('local-1', 'Проповеди', ['a'])]

    expect(
      findDuplicateLocalPlaylist(playlists, { sermonIds: ['a'], title: 'Другое' }),
    ).toBeUndefined()
  })

  test('returns undefined when the sermon-id set differs', () => {
    const playlists = [playlist('local-1', 'Проповеди', ['a'])]

    expect(
      findDuplicateLocalPlaylist(playlists, { sermonIds: ['a', 'b'], title: 'Проповеди' }),
    ).toBeUndefined()
  })

  test('never matches favorites', () => {
    const favorites = { ...FAVORITES_PLAYLIST, sermonIds: ['a'], sermons: [] }

    expect(
      findDuplicateLocalPlaylist([favorites], {
        sermonIds: ['a'],
        title: FAVORITES_PLAYLIST.title,
      }),
    ).toBeUndefined()
  })
})
