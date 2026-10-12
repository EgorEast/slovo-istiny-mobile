import { act, renderHook } from '@testing-library/react-native'
import { hapticLight } from 'shared/lib/haptics'
import { useEdgeTapSeek } from './useEdgeTapSeek'

jest.mock('shared/lib/haptics', () => ({ hapticLight: jest.fn() }))

const mockedHapticLight = jest.mocked(hapticLight)

const FORWARD = 'forward'
const BACKWARD = 'backward'
const WITHIN_WINDOW_MS = 200
const AFTER_WINDOW_MS = 500

describe('useEdgeTapSeek', () => {
  let tapSeek: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    tapSeek = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('first tap of a burst does not seek', async () => {
    const { result } = await renderHook(() => useEdgeTapSeek(tapSeek))

    await act(() => {
      result.current.handleEdgeTap(FORWARD)
    })

    expect(tapSeek).not.toHaveBeenCalled()
    expect(mockedHapticLight).not.toHaveBeenCalled()
  })

  test('second tap within the window seeks once', async () => {
    const { result } = await renderHook(() => useEdgeTapSeek(tapSeek))

    await act(() => {
      result.current.handleEdgeTap(FORWARD)
    })
    await act(() => {
      jest.advanceTimersByTime(WITHIN_WINDOW_MS)
      result.current.handleEdgeTap(FORWARD)
    })

    expect(tapSeek).toHaveBeenCalledTimes(1)
    expect(tapSeek).toHaveBeenCalledWith(FORWARD)
  })

  test('rapid extra taps accumulate', async () => {
    const { result } = await renderHook(() => useEdgeTapSeek(tapSeek))

    await act(() => {
      result.current.handleEdgeTap(FORWARD)
    })
    await act(() => {
      jest.advanceTimersByTime(WITHIN_WINDOW_MS)
      result.current.handleEdgeTap(FORWARD)
    })
    await act(() => {
      jest.advanceTimersByTime(WITHIN_WINDOW_MS)
      result.current.handleEdgeTap(FORWARD)
    })

    expect(tapSeek).toHaveBeenCalledTimes(2)
    expect(mockedHapticLight).toHaveBeenCalledTimes(2)
  })

  test('a tap after the window starts a new burst', async () => {
    const { result } = await renderHook(() => useEdgeTapSeek(tapSeek))

    await act(() => {
      result.current.handleEdgeTap(FORWARD)
    })
    await act(() => {
      jest.advanceTimersByTime(AFTER_WINDOW_MS)
      result.current.handleEdgeTap(FORWARD)
    })

    expect(tapSeek).not.toHaveBeenCalled()

    await act(() => {
      jest.advanceTimersByTime(WITHIN_WINDOW_MS)
      result.current.handleEdgeTap(FORWARD)
    })

    expect(tapSeek).toHaveBeenCalledTimes(1)
  })

  test('sides are independent', async () => {
    const { result } = await renderHook(() => useEdgeTapSeek(tapSeek))

    await act(() => {
      result.current.handleEdgeTap(FORWARD)
    })
    await act(() => {
      jest.advanceTimersByTime(WITHIN_WINDOW_MS)
      result.current.handleEdgeTap(FORWARD)
    })
    await act(() => {
      jest.advanceTimersByTime(WITHIN_WINDOW_MS)
      result.current.handleEdgeTap(BACKWARD)
    })

    // The backward tap is the first of its own burst, so it must not seek even
    // though it falls inside the forward burst's window.
    expect(tapSeek).toHaveBeenCalledTimes(1)
    expect(tapSeek).toHaveBeenCalledWith(FORWARD)
  })
})
