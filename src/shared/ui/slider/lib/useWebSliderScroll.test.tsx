import { act, render } from '@testing-library/react-native'
import { Platform } from 'react-native'
import { useWebSliderScroll } from './useWebSliderScroll'

type EventHandler = (event: unknown) => void

interface FakeClickEvent extends FakeEvent {
  preventDefault: jest.Mock
}

interface FakeEvent {
  propagationStopped: boolean
  stopPropagation: jest.Mock
}

interface FakeNode {
  addEventListener: jest.Mock
  dispatch: (type: string, event: FakeEvent) => void
  receivedMoves: () => number
  removeEventListener: jest.Mock
  scrollLeft: number
}

interface FakeTouchEvent extends FakeEvent {
  timeStamp: number
  touches: { clientX: number; clientY: number }[]
}

type FrameCallback = (timestamp: number) => void

const originalRaf = global.requestAnimationFrame
const originalCancelRaf = global.cancelAnimationFrame

let frames: FrameCallback[] = []

const createFakeNode = (parent?: FakeNode): FakeNode => {
  const listeners: Record<string, EventHandler[]> = {}
  const received: Record<string, number> = {}
  return {
    addEventListener: jest.fn((type: string, handler: EventHandler) => {
      ;(listeners[type] ??= []).push(handler)
    }),
    // Пузырим в предка, если обработчик не остановил распространение: так тест
    // видит, доходит ли touchmove до pull-to-refresh на предке.
    dispatch: (type: string, event: FakeEvent) => {
      received[type] = (received[type] ?? 0) + 1
      listeners[type]?.forEach(handler => handler(event))
      if (!event.propagationStopped) parent?.dispatch(type, event)
    },
    receivedMoves: () => received.touchmove ?? 0,
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

const touch = (clientX: number, clientY: number, timeStamp: number): FakeTouchEvent => {
  const event: FakeTouchEvent = {
    propagationStopped: false,
    stopPropagation: jest.fn(),
    timeStamp,
    touches: [{ clientX, clientY }],
  }
  event.stopPropagation.mockImplementation(() => {
    event.propagationStopped = true
  })
  return event
}

const touchEnd = (timeStamp: number): FakeTouchEvent => ({
  propagationStopped: false,
  stopPropagation: jest.fn(),
  timeStamp,
  touches: [],
})

const click = (): FakeClickEvent => ({
  preventDefault: jest.fn(),
  propagationStopped: false,
  stopPropagation: jest.fn(),
})

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
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(180, 0, 16))
    })
    expect(node.scrollLeft).toBe(20)

    await act(async () => {
      node.dispatch('touchmove', touch(150, 0, 32))
    })
    expect(node.scrollLeft).toBe(50)
  })

  test('flings to the nearest snap offset within the travel bound', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200, 300], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(191, 0, 1))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(190, 0, 2))
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

  test('locks to horizontal on a mostly horizontal move and stops ancestor moves', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200, 300], 120)
    const parent = createFakeNode()
    const node = createFakeNode(parent)
    await attachNode(getScroll, node)
    const firstMove = touch(160, 6, 16)
    const secondMove = touch(150, 6, 32)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', firstMove)
    })
    await act(async () => {
      node.dispatch('touchmove', secondMove)
    })
    expect(node.scrollLeft).toBe(50)

    await act(async () => {
      node.dispatch('touchend', touchEnd(32))
    })
    runAllFrames()

    expect(node.scrollLeft).toBe(200)
    expect(firstMove.stopPropagation).toHaveBeenCalledTimes(1)
    expect(secondMove.stopPropagation).toHaveBeenCalledTimes(1)
    expect(parent.receivedMoves()).toBe(0)
  })

  test('locks to vertical and leaves the gesture to the page and pull-to-refresh', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const parent = createFakeNode()
    const node = createFakeNode(parent)
    await attachNode(getScroll, node)
    const firstMove = touch(205, 40, 16)
    const secondMove = touch(210, 80, 32)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', firstMove)
    })
    await act(async () => {
      node.dispatch('touchmove', secondMove)
    })
    await act(async () => {
      node.dispatch('touchend', touchEnd(32))
    })

    expect(node.scrollLeft).toBe(0)
    expect(firstMove.stopPropagation).not.toHaveBeenCalled()
    expect(secondMove.stopPropagation).not.toHaveBeenCalled()
    expect(parent.receivedMoves()).toBe(2)
    expect(frames).toHaveLength(0)
  })

  test('does not engage on a sub-threshold move', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)
    const move = touch(196, 4, 16)

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', move)
    })
    await act(async () => {
      node.dispatch('touchend', touchEnd(16))
    })

    expect(node.scrollLeft).toBe(0)
    expect(move.stopPropagation).not.toHaveBeenCalled()
    expect(node.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function), true)
    expect(frames).toHaveLength(0)
  })

  test('swallows the click that closes a horizontal swipe', async () => {
    const getScroll = await renderSliderScroll([0, 100, 200], 120)
    const node = createFakeNode()
    await attachNode(getScroll, node)
    const swipeClick = click()
    const laterClick = click()

    await act(async () => {
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(160, 0, 16))
    })
    await act(async () => {
      node.dispatch('touchend', touchEnd(16))
    })
    await act(async () => {
      node.dispatch('click', swipeClick)
    })
    await act(async () => {
      node.dispatch('click', laterClick)
    })

    expect(swipeClick.preventDefault).toHaveBeenCalledTimes(1)
    expect(swipeClick.stopPropagation).toHaveBeenCalledTimes(1)
    expect(laterClick.preventDefault).not.toHaveBeenCalled()
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
      node.dispatch('touchstart', touch(200, 0, 0))
    })
    await act(async () => {
      node.dispatch('touchmove', touch(150, 0, 16))
    })
    await act(async () => {
      node.dispatch('touchend', touchEnd(16))
    })
    runFrame(16)
    const frozen = node.scrollLeft

    await act(async () => {
      node.dispatch('touchstart', touch(300, 0, 32))
    })
    runAllFrames()

    expect(node.scrollLeft).toBe(frozen)
  })
})
