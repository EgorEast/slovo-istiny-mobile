import { MAX_CUSTOM_PLAYLIST_SERMONS } from '../localPlaylists'
import { buildCustomPlaylistSearchParams, parseCustomPlaylistParams } from './customPlaylistShare'
import { packSermonIds, unpackSermonIds } from './sermonIdPacking'

const CYRILLIC_TITLE = 'Избранные проповеди пастора'
const SERMON_IDS = ['sermon-1', 'sermon-2']
const UUID_A = '0f0e8d6c-1a2b-4c3d-9e8f-001122334455'
const UUID_B = '11111111-2222-4333-8444-555555555555'
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/

const uuid = (index: number): string =>
  `${index.toString(16).padStart(8, '0')}-0000-4000-8000-000000000000`

describe('customPlaylistShare', () => {
  test('builds readable params with the custom marker, title and sermon ids', () => {
    const params = buildCustomPlaylistSearchParams({ sermonIds: SERMON_IDS, title: CYRILLIC_TITLE })

    expect(params.get('custom')).toBe('')
    expect(params.get('title')).toBe(CYRILLIC_TITLE)
    expect(params.get('sermons')).toBe('sermon-1,sermon-2')
  })

  test('round-trips a cyrillic title and sermon ids through URL encoding', () => {
    const serialized = buildCustomPlaylistSearchParams({
      sermonIds: SERMON_IDS,
      title: CYRILLIC_TITLE,
    }).toString()
    const rehydrated = new URLSearchParams(serialized)

    expect(
      parseCustomPlaylistParams({
        sermons: rehydrated.get('sermons') ?? undefined,
        title: rehydrated.get('title') ?? undefined,
      }),
    ).toEqual({ sermonIds: SERMON_IDS, title: CYRILLIC_TITLE })
  })

  test('URI-encodes cyrillic characters in the serialized query', () => {
    const serialized = buildCustomPlaylistSearchParams({
      sermonIds: SERMON_IDS,
      title: CYRILLIC_TITLE,
    }).toString()

    expect(serialized).not.toContain(CYRILLIC_TITLE)
    // 'Из' as percent-encoded UTF-8 bytes.
    expect(serialized).toContain('%D0%98%D0%B7')
  })

  test('normalizes a comma-separated string and trims ids', () => {
    expect(parseCustomPlaylistParams({ sermons: ' a , b ,, c ', title: '  Проповеди  ' })).toEqual({
      sermonIds: ['a', 'b', 'c'],
      title: 'Проповеди',
    })
  })

  test('accepts a repeated (array) sermons param', () => {
    expect(parseCustomPlaylistParams({ sermons: ['a,b', 'c'], title: 'Проповеди' })).toEqual({
      sermonIds: ['a', 'b', 'c'],
      title: 'Проповеди',
    })
  })

  test('returns null for a missing or blank title', () => {
    expect(parseCustomPlaylistParams({ sermons: 'a', title: undefined })).toBeNull()
    expect(parseCustomPlaylistParams({ sermons: 'a', title: '   ' })).toBeNull()
  })

  test('returns null for an empty sermon list', () => {
    expect(parseCustomPlaylistParams({ sermons: undefined, title: 'Проповеди' })).toBeNull()
    expect(parseCustomPlaylistParams({ sermons: '', title: 'Проповеди' })).toBeNull()
    expect(parseCustomPlaylistParams({ sermons: ' , , ', title: 'Проповеди' })).toBeNull()
  })
})

describe('packed sermon ids', () => {
  test('packs UUIDs into one base64url string and round-trips them', () => {
    const packed = packSermonIds([UUID_A, UUID_B])

    expect(packed).toMatch(BASE64URL_PATTERN)
    expect(unpackSermonIds(packed ?? '')).toEqual([UUID_A, UUID_B])
  })

  test('falls back to null for non-UUID ids and empty lists', () => {
    expect(packSermonIds(['sermon-1'])).toBeNull()
    expect(packSermonIds([UUID_A, 'sermon-1'])).toBeNull()
    expect(packSermonIds([])).toBeNull()
  })

  test('rejects csv, empty and non-whole-UUID payloads on unpack', () => {
    expect(unpackSermonIds('sermon-1,sermon-2')).toBeNull()
    expect(unpackSermonIds('A')).toBeNull()
    expect(unpackSermonIds('')).toBeNull()
  })

  test('builds packed params for UUID ids and parses them back', () => {
    const params = buildCustomPlaylistSearchParams({ sermonIds: [UUID_A, UUID_B], title: 'Список' })
    const sermons = params.get('sermons')

    expect(sermons).toMatch(BASE64URL_PATTERN)
    expect(sermons).not.toContain(UUID_A)

    expect(parseCustomPlaylistParams({ sermons: sermons ?? undefined, title: 'Список' })).toEqual({
      sermonIds: [UUID_A, UUID_B],
      title: 'Список',
    })
  })

  test('keeps the readable csv form when an id is not a UUID', () => {
    const params = buildCustomPlaylistSearchParams({ sermonIds: SERMON_IDS, title: 'Список' })

    expect(params.get('sermons')).toBe('sermon-1,sermon-2')
  })

  test('rejects a payload longer than the maximum in both forms', () => {
    const ids = Array.from({ length: MAX_CUSTOM_PLAYLIST_SERMONS + 1 }, (_, index) => uuid(index))

    expect(
      parseCustomPlaylistParams({ sermons: packSermonIds(ids) ?? undefined, title: 'Список' }),
    ).toBeNull()
    expect(parseCustomPlaylistParams({ sermons: ids.join(','), title: 'Список' })).toBeNull()
  })
})
