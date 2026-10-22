import { createCtx } from '@reatom/framework'
import { act } from '@testing-library/react-native'
import { type SermonData } from 'entities/sermon'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { FAVORITES_PLAYLIST, type LocalPlaylistData } from '../localPlaylists'
import { myPlaylistsAtom } from '../model'
import { useFavoriteSermon } from './useFavoriteSermon'

const SERMON: SermonData = {
  artist: 'Pastor',
  artwork: null,
  audioUrl: 'https://cdn/sermon-1.mp3',
  id: 'sermon-1',
  title: 'Слово',
}

const favoritesWith = (sermons: SermonData[]): LocalPlaylistData => ({
  ...FAVORITES_PLAYLIST,
  sermonIds: sermons.map(sermon => sermon.id),
  sermons,
})

const renderFavoriteHook = async (sermon: null | SermonData, playlists?: LocalPlaylistData[]) => {
  const ctx = createCtx()
  myPlaylistsAtom(ctx, playlists ?? [FAVORITES_PLAYLIST])
  const utils = await renderHookWithProviders(() => useFavoriteSermon(sermon), { ctx })
  return { ...utils, ctx }
}

describe('useFavoriteSermon', () => {
  test('reports a sermon that is already in favorites', async () => {
    const { result } = await renderFavoriteHook(SERMON, [favoritesWith([SERMON])])

    expect(result.current.isFavorite).toBe(true)
  })

  test('reports a sermon outside favorites', async () => {
    const { result } = await renderFavoriteHook(SERMON, [FAVORITES_PLAYLIST])

    expect(result.current.isFavorite).toBe(false)
  })

  test('adds the sermon to favorites on toggle', async () => {
    const { ctx, result } = await renderFavoriteHook(SERMON)

    await act(async () => {
      result.current.toggleFavorite()
    })

    const favorites = ctx.get(myPlaylistsAtom).find(playlist => playlist.id === 'favorites')
    expect(favorites?.sermonIds).toContain(SERMON.id)
  })

  test('removes the sermon from favorites on toggle', async () => {
    const { ctx, result } = await renderFavoriteHook(SERMON, [favoritesWith([SERMON])])

    await act(async () => {
      result.current.toggleFavorite()
    })

    const favorites = ctx.get(myPlaylistsAtom).find(playlist => playlist.id === 'favorites')
    expect(favorites?.sermonIds).not.toContain(SERMON.id)
  })

  test('is inert for a null sermon', async () => {
    const { ctx, result } = await renderFavoriteHook(null)

    expect(result.current.isFavorite).toBe(false)

    await act(async () => {
      result.current.toggleFavorite()
    })

    expect(ctx.get(myPlaylistsAtom)).toEqual([FAVORITES_PLAYLIST])
  })
})
