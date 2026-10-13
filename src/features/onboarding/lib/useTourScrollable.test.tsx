import { type ScrollView } from 'react-native'
import { renderHookWithProviders } from 'shared/mocks'
import { getTourScrollable, unregisterTourScrollable } from './tourScrollable'
import { useTourScrollable } from './useTourScrollable'

const SCROLL_Y = 120

describe('useTourScrollable', () => {
  afterEach(() => {
    unregisterTourScrollable()
  })

  test('registers the scroll view, forwards scrollTo, and unregisters on detach', async () => {
    const scrollTo = jest.fn()
    const node = { scrollTo } as unknown as ScrollView
    const { result } = await renderHookWithProviders(() => useTourScrollable())

    result.current(node)

    expect(getTourScrollable()).not.toBeNull()

    getTourScrollable()?.scrollTo(SCROLL_Y, true)

    expect(scrollTo).toHaveBeenCalledWith({ animated: true, y: SCROLL_Y })

    result.current(null)

    expect(getTourScrollable()).toBeNull()
  })
})
