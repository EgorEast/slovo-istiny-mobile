import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { useTourActionRegistrar } from 'features/onboarding'
import { searchQueryAtom, searchResultsAtom } from 'features/sermon-search'
import { type SermonData } from 'entities/sermon'
import { renderHookWithProviders } from 'shared/mocks'
import { useSearchTourActions } from './useSearchTourActions'

jest.mock('features/onboarding', () => ({
  useTourActionRegistrar: jest.fn(),
}))

// The real barrel drags in the player/native audio graph; the hook only needs the
// query and results atoms, so mock the module with fresh ones.
jest.mock('features/sermon-search', () => {
  const { atom } = jest.requireActual('@reatom/framework')

  return {
    searchQueryAtom: atom('', 'mockSearchQueryAtom'),
    searchResultsAtom: atom([], 'mockSearchResultsAtom'),
  }
})

const TYPE_SEARCH_QUERY = 'type-search-query'
const PRESS_FIRST_SERMON = 'press-first-sermon'
const FULL_QUERY = 'лицемерие'

const SERMON: SermonData = {
  artist: 'Проповедник',
  artwork: null,
  audioUrl: 'https://example.com/sermon.mp3',
  id: 'sermon-1',
  title: 'Проповедь',
}

const getRegisteredAction = (id: string) => {
  const matches = jest
    .mocked(useTourActionRegistrar)
    .mock.calls.filter(([registeredId]) => registeredId === id)

  return matches.at(-1)?.[1]
}

const renderActions = async (
  onPressFirstSermon: (sermon: SermonData) => void,
  sermons: SermonData[] = [],
) => {
  const ctx = createCtx()
  searchResultsAtom(ctx, sermons)

  await renderHookWithProviders(() => useSearchTourActions({ onPressFirstSermon }), { ctx })

  return ctx
}

describe('useSearchTourActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('types the demo query into the search atom prefix by prefix', async () => {
    const ctx = await renderActions(jest.fn())

    await act(async () => {
      getRegisteredAction(TYPE_SEARCH_QUERY)?.()
    })

    // The first character lands synchronously; the rest follow on real delays.
    expect(ctx.get(searchQueryAtom)).toBe('л')

    await waitFor(() => expect(ctx.get(searchQueryAtom)).toBe(FULL_QUERY), { timeout: 3000 })
  })

  test('stops typing when the sequence is cancelled on unmount', async () => {
    const ctx = createCtx()
    const { unmount } = await renderHookWithProviders(
      () => useSearchTourActions({ onPressFirstSermon: jest.fn() }),
      { ctx },
    )

    await act(async () => {
      getRegisteredAction(TYPE_SEARCH_QUERY)?.()
    })

    const typedBeforeUnmount = ctx.get(searchQueryAtom)
    await unmount()
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    })

    expect(ctx.get(searchQueryAtom)).toBe(typedBeforeUnmount)
  })

  test('presses the first rendered sermon', async () => {
    const onPressFirstSermon = jest.fn()
    await renderActions(onPressFirstSermon, [SERMON])

    await act(async () => {
      getRegisteredAction(PRESS_FIRST_SERMON)?.()
    })

    expect(onPressFirstSermon).toHaveBeenCalledWith(SERMON)
  })

  test('does nothing when no sermon is rendered', async () => {
    const onPressFirstSermon = jest.fn()
    await renderActions(onPressFirstSermon)

    await act(async () => {
      getRegisteredAction(PRESS_FIRST_SERMON)?.()
    })

    expect(onPressFirstSermon).not.toHaveBeenCalled()
  })
})
