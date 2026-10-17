import { type SectionData } from 'entities/section/@x/playlist'
import { type SermonShape } from 'shared/model'
import { type LocalPlaylistData } from '../localPlaylists'
import { buildSermonIndex } from './buildSermonIndex'

const SERMON_A: SermonShape = { artist: 'Автор A', artwork: null, id: 's1', title: 'Проповедь A' }
const SERMON_B: SermonShape = { artist: 'Автор B', artwork: null, id: 's2', title: 'Проповедь B' }
const SERMON_A_DUPLICATE: SermonShape = {
  artist: 'Другой автор',
  artwork: null,
  id: 's1',
  title: 'Дубль A',
}

const playlistOf = (sermons: SermonShape[]) => ({
  artwork: null,
  id: 'playlist-1',
  sermons,
  title: 'Плейлист',
})

const sectionOf = (playlists: SectionData['playlists']): SectionData => ({
  id: 'section-1',
  itemsSize: 'small',
  playlists,
  title: 'Раздел',
  transform: 'short',
})

const localPlaylistOf = (sermons: SermonShape[]): LocalPlaylistData => ({
  id: 'local-1',
  sermonIds: sermons.map(sermon => sermon.id),
  sermons,
  title: 'Мой плейлист',
})

describe('buildSermonIndex', () => {
  test('keeps the first occurrence of a duplicated id across sections', () => {
    const sections = [
      sectionOf([playlistOf([SERMON_A])]),
      sectionOf([playlistOf([SERMON_A_DUPLICATE, SERMON_B])]),
    ]

    const index = buildSermonIndex(sections, [])

    expect(index.get('s1')).toBe(SERMON_A)
    expect(index.get('s2')).toBe(SERMON_B)
  })

  test('section playlists win over local playlist snapshots', () => {
    const sections = [sectionOf([playlistOf([SERMON_A])])]
    const localPlaylists = [localPlaylistOf([SERMON_A_DUPLICATE, SERMON_B])]

    const index = buildSermonIndex(sections, localPlaylists)

    expect(index.get('s1')).toBe(SERMON_A)
    expect(index.get('s2')).toBe(SERMON_B)
  })

  test('collects local playlist snapshots when there are no sections', () => {
    const index = buildSermonIndex([], [localPlaylistOf([SERMON_A, SERMON_B])])

    expect([...index.values()]).toEqual([SERMON_A, SERMON_B])
  })

  test('handles sections whose playlists field is undefined', () => {
    const index = buildSermonIndex([sectionOf(undefined)], [localPlaylistOf([SERMON_A])])

    expect([...index.values()]).toEqual([SERMON_A])
  })
})
