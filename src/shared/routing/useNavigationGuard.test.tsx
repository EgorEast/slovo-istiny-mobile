import { act, renderHook } from '@testing-library/react-native'
import { NAVIGATION_GUARD_MS, useNavigationGuard } from './useNavigationGuard'

describe('useNavigationGuard', () => {
  test('runs the navigation once for rapid repeated calls', async () => {
    const { result } = await renderHook(() => useNavigationGuard())
    const navigate = jest.fn()

    result.current(navigate)
    result.current(navigate)

    expect(navigate).toHaveBeenCalledTimes(1)
  })

  test('runs the next navigation once the guard window has elapsed', async () => {
    jest.useFakeTimers()
    try {
      const { result } = await renderHook(() => useNavigationGuard())
      const navigate = jest.fn()

      result.current(navigate)
      act(() => {
        jest.advanceTimersByTime(NAVIGATION_GUARD_MS)
      })
      result.current(navigate)

      expect(navigate).toHaveBeenCalledTimes(2)
    } finally {
      jest.useRealTimers()
    }
  })
})
