import { type SermonShape } from 'shared/model'
import { type LocalPlaylistData } from '../localPlaylists'
import { buildLocalPlaylist } from './buildLocalPlaylist'

const SERMON_A: SermonShape = { artist: 'Автор A', artwork: null, id: 's1', title: 'Проповедь A' }
const SERMON_B: SermonShape = { artist: 'Автор B', artwork: null, id: 's2', title: 'Проповедь B' }

const localPlaylist = (overrides: Partial<LocalPlaylistData> = {}): LocalPlaylistData => ({
  id: 'local-1',
  sermonIds: [],
  sermons: [],
  title: 'Мой плейлист',
  ...overrides,
})

describe('buildLocalPlaylist', () => {
  test('returns stored sermon snapshots as-is and ignores sermonIds', () => {
    const snapshots = [SERMON_B, SERMON_A]
    const local = localPlaylist({ sermonIds: ['unknown-id'], sermons: snapshots })

    const result = buildLocalPlaylist(local, new Map([['s1', SERMON_A]]))

    expect(result.sermons).toBe(snapshots)
    expect(result).toEqual({
      artwork: null,
      description: '',
      id: 'local-1',
      sermons: snapshots,
      title: 'Мой плейлист',
    })
  })

  test('resolves an id-only playlist through the index in sermonIds order', () => {
    const local = localPlaylist({ sermonIds: ['s2', 's1'] })
    const sermonIndex = new Map([
      ['s1', SERMON_A],
      ['s2', SERMON_B],
    ])

    expect(buildLocalPlaylist(local, sermonIndex).sermons).toEqual([SERMON_B, SERMON_A])
  })

  test('skips unknown ids without reordering the resolved ones', () => {
    const local = localPlaylist({ sermonIds: ['missing', 's1', 'also-missing', 's2'] })
    const sermonIndex = new Map([
      ['s1', SERMON_A],
      ['s2', SERMON_B],
    ])

    expect(buildLocalPlaylist(local, sermonIndex).sermons).toEqual([SERMON_A, SERMON_B])
  })

  test('stays empty when no id resolves', () => {
    const local = localPlaylist({ sermonIds: ['missing'] })

    expect(buildLocalPlaylist(local, new Map()).sermons).toEqual([])
  })
})
