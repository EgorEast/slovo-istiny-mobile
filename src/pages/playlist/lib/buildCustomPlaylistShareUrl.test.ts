import { parseCustomPlaylistParams } from 'entities/playlist'
import { ENV } from 'shared/config'
import { buildCustomPlaylistShareUrl } from './buildCustomPlaylistShareUrl'

const UUID_A = '0f0e8d6c-1a2b-4c3d-9e8f-001122334455'
const UUID_B = '11111111-2222-4333-8444-555555555555'
const TITLE = 'Мой плейлист'

const paramsFrom = (url: string) => new URLSearchParams(url.split('?')[1])

describe('buildCustomPlaylistShareUrl', () => {
  test('packs UUID sermon ids into one base64url param without raw ids', () => {
    const result = buildCustomPlaylistShareUrl({ sermonIds: [UUID_A, UUID_B], title: TITLE })
    const sermons = paramsFrom(result).get('sermons')

    expect(result.startsWith(`https://${ENV.webHostname}/listen/playlist?custom&title=`)).toBe(true)
    expect(result).not.toContain('custom=')
    // The packed payload is compact and leaks no UUID or csv separator.
    expect(sermons).not.toBeNull()
    expect(sermons).not.toContain(UUID_A)
    expect(sermons).not.toContain(',')
    // The cyrillic title is URI-encoded, not embedded raw.
    expect(result).not.toContain(TITLE)
  })

  test('round-trips packed sermon ids and the title through the query string', () => {
    const result = buildCustomPlaylistShareUrl({ sermonIds: [UUID_A, UUID_B], title: TITLE })
    const params = paramsFrom(result)

    expect(params.has('custom')).toBe(true)
    expect(
      parseCustomPlaylistParams({
        sermons: params.get('sermons') ?? undefined,
        title: params.get('title') ?? undefined,
      }),
    ).toEqual({ sermonIds: [UUID_A, UUID_B], title: TITLE })
  })

  test('falls back to the readable csv form for non-UUID ids', () => {
    const result = buildCustomPlaylistShareUrl({ sermonIds: ['s1', 's2'], title: TITLE })
    const params = paramsFrom(result)

    expect(params.get('sermons')).toBe('s1,s2')
    expect(
      parseCustomPlaylistParams({
        sermons: params.get('sermons') ?? undefined,
        title: params.get('title') ?? undefined,
      }),
    ).toEqual({ sermonIds: ['s1', 's2'], title: TITLE })
  })
})
