import { act, render } from '@testing-library/react-native'
import { Platform } from 'react-native'
import { useWebSliderScroll } from './useWebSliderScroll'

type EventHandler = (event: unknown) => void

type FrameCallback = (timestamp: number) => void

const originalRaf = global.requestAnimationFrame
const originalCancelRaf = global.cancelAnimationFrame

let frames: FrameCallback[] = []

const createFakeNode = () => {
  const listeners: Record<string, EventHandler[]> = {}
  return {
    addEventListener: jest.fn((type: string, handler: EventHandler) => {
      ;(listeners[type] ??= []).push(handler)
    }),
    dispatch: (type: string, event: unknown) => {
      listeners[type]?.forEach(handler => handler(event))
    },
    removeEventListener: jest.fn((type: string, handler: EventHandler) => {
      const typeListeners = listeners[type]
      if (!typeListeners) return
      const index = typeListeners.indexOf(handler)
      if (index !== -1) typeListeners.splice(index, 1)
    }),
    scrollLeft: 0,
  }
}

const renderSliderScroll = async (offsets: number[], maxTravelPx: number) => {
  let scroll: null | ReturnType<typeof useWebSliderScroll> = null
  const Harness = () => {
    scroll = useWebSliderScroll(offsets, maxTravelPx)
    return null
  }
  await render(<Harness />)
  return () => {
    if (!scroll) throw new Error('hook not captured')
    return scroll
  }
}

const attachNode = async (
  getScroll: () => ReturnType<typeof useWebSliderScroll>,
  node: ReturnType<typeof createFakeNode>,
) => {
  await act(async () => {
    getScroll().scrollRef({ getScrollableNode: () => node })
  })
}

const touch = (clientX: number, timeStamp: number) => ({
  timeStamp,
  touches: [{ clientX }],
})

const touchEnd = (timeStamp: number) => ({ timeStamp, touches: [] })

const runFrame = (timestamp: number) => {
  const callback = frames.shift()
  if (!callback) throw new Error('no frame scheduled')
  callback(timestamp)
}

const runAllFrames = () => {
  let timestamp = 0
  while (frames.length > 0) {
    timestamp += 16
    runFrame(timestamp)
  }
}

describe('useWebSliderScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.replaceProperty(Platform, 'OS', 'web')
    frames = []
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    global.requestAnimationFrame = originalRaf
    global.cancelAnimationFrame = originalCancelRaf
  })

  test('drags scrollLeft 1:1 while the finger is down', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(180, 16))
    })
    expect(node.scrollLeft).toBe(20)

    await act(async () => {
      node.dispatch('touchmove', touch(150, 32))
    })
    expect(node.scrollLeft).toBe(50)
  })

  test('flings to the nearest snap offset within the travel bound', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200, 300], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(191, 1))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(190, 2))
    })
    expect(node.scrollLeft).toBe(10)

    await act(async () => {
      node.dispatch('touchend', touchEnd(2))
    })
    runAllFrames()

    // Unclamped projection (10 + 1 px/ms * 300) would reach 300.
    expect(node.scrollLeft).toBe(100)
    expect(Math.abs(node.scrollLeft - 10)).toBeLessThanOrEqual(120)
  })

  test('does not engage on a sub-threshold move', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(199, 16))
    })
    await act(async () => {
      node.dispatch('touchend', touchEnd(16))
    })

    expect(node.scrollLeft).toBe(0)
    expect(frames).toHaveLength(0)
  })

  test('glides to the nearest offset after scroll quiet', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)
    node.scrollLeft = 60

    await act(async () => {
      getScroll().onScroll?.({ nativeEvent: { contentOffset: { x: 60 } } })
    })
    await act(async () => {
      jest.advanceTimersByTime(160)
    })
    runAllFrames()

    expect(node.scrollLeft).toBe(100)
  })

  test('a new touchstart cancels an in-flight glide', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(150, 16))
    })
    await act(async () => {
      node.dispatch('touchend', touchEnd(16))
    })
    runFrame(16)
    const frozen = node.scrollLeft

    await act(async () => {
      node.dispatch('touchstart', touch(300, 32))
    })
    runAllFrames()

    expect(node.scrollLeft).toBe(frozen)
  })
})
