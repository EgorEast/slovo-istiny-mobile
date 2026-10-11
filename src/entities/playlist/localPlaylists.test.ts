import { type SermonShape } from 'shared/model'
import { normalizeLocalPlaylist } from './localPlaylists'

const SERMON_A: SermonShape = { artist: 'A', artwork: null, id: 'a', title: 'A' }
const SERMON_B: SermonShape = { artist: 'B', artwork: null, id: 'b', title: 'B' }
const SERMON_D: SermonShape = { artist: 'D', artwork: null, id: 'd', title: 'D' }

describe('normalizeLocalPlaylist', () => {
  test('keeps stored sermonIds authoritative while sermons stay a snapshot subset', () => {
    const result = normalizeLocalPlaylist({
      id: 'p',
      sermonIds: ['a', 'b', 'c', 'd'],
      sermons: [SERMON_D],
      title: 'P',
    })

    expect(result.sermonIds).toEqual(['a', 'b', 'c', 'd'])
    expect(result.sermons).toEqual([SERMON_D])
  })

  test('drops snapshots whose id is no longer a member', () => {
    const result = normalizeLocalPlaylist({
      id: 'p',
      sermonIds: ['a'],
      sermons: [SERMON_A, SERMON_B],
      title: 'P',
    })

    expect(result.sermonIds).toEqual(['a'])
    expect(result.sermons).toEqual([SERMON_A])
  })

  test('deduplicates stored sermonIds and drops empty strings', () => {
    const result = normalizeLocalPlaylist({
      id: 'p',
      sermonIds: ['a', 'a', '', 'b'],
      sermons: [],
      title: 'P',
    })

    expect(result.sermonIds).toEqual(['a', 'b'])
  })

  test('derives sermonIds from sermons for legacy rows without stored ids', () => {
    const result = normalizeLocalPlaylist({ id: 'p', sermons: [SERMON_A, SERMON_B], title: 'P' })

    expect(result.sermonIds).toEqual(['a', 'b'])
    expect(result.sermons).toEqual([SERMON_A, SERMON_B])
  })

  test('keeps an empty row empty', () => {
    const result = normalizeLocalPlaylist({ id: 'p', sermonIds: [], sermons: [], title: 'P' })

    expect(result.sermonIds).toEqual([])
    expect(result.sermons).toEqual([])
  })
})
