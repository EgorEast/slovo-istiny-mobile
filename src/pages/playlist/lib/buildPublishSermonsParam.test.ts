import { type LocalPlaylistData } from 'entities/playlist'
import { buildPublishSermonsParam } from './buildPublishSermonsParam'

const PLAYLIST: LocalPlaylistData = {
  id: 'local-1',
  sermonIds: ['s1', 's2', 's3'],
  sermons: [
    { artist: 'A1', artwork: null, id: 's1', title: 'S1' },
    { artist: 'A2', artwork: 'art2.jpg', id: 's2', title: 'S2' },
  ],
  title: 'Проповеди',
}

describe('buildPublishSermonsParam', () => {
  test('serializes snapshots in sermonIds order and id-only entries for missing ones', () => {
    const parsed = JSON.parse(buildPublishSermonsParam(PLAYLIST))

    expect(parsed).toEqual([
      { artist: 'A1', artwork: null, id: 's1', title: 'S1' },
      { artist: 'A2', artwork: 'art2.jpg', id: 's2', title: 'S2' },
      { id: 's3' },
    ])
  })

  test('serializes an empty playlist as an empty array', () => {
    const empty: LocalPlaylistData = { id: 'local-2', sermonIds: [], sermons: [], title: 'Пусто' }

    expect(buildPublishSermonsParam(empty)).toBe('[]')
  })
})
