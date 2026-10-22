import { easeOutCubic, getGlideDurationMs, startScrollGlide } from './webScrollGlide'

type FrameCallback = (timestamp: number) => void

const originalRaf = global.requestAnimationFrame
const originalCancelRaf = global.cancelAnimationFrame

let frames: FrameCallback[] = []

const runFrame = (timestamp: number) => {
  const callback = frames.shift()
  if (!callback) throw new Error('no frame scheduled')
  callback(timestamp)
}

describe('webScrollGlide', () => {
  beforeEach(() => {
    frames = []
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    global.requestAnimationFrame = originalRaf
    global.cancelAnimationFrame = originalCancelRaf
  })

  test('eases from 0 to 1 with deceleration', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(0.5)).toBe(0.875)
    expect(easeOutCubic(1)).toBe(1)
  })

  test('scales duration with distance and clamps it', () => {
    expect(getGlideDurationMs(0)).toBe(140)
    expect(getGlideDurationMs(400)).toBe(280)
    expect(getGlideDurationMs(10000)).toBe(600)
  })

  test('writes intermediate offsets and lands exactly on the target', () => {
    const node = { scrollLeft: 100 }
    const glide = startScrollGlide({ durationMs: 200, from: 100, node, to: 200 })

    runFrame(0)
    expect(node.scrollLeft).toBe(100)

    runFrame(100)
    expect(node.scrollLeft).toBeGreaterThan(100)
    expect(node.scrollLeft).toBeLessThan(200)

    runFrame(200)
    expect(node.scrollLeft).toBe(200)
    expect(frames).toHaveLength(0)
    glide.cancel()
  })

  test('jumps straight to the target when the gap is negligible', () => {
    const node = { scrollLeft: 100.2 }
    startScrollGlide({ durationMs: 200, from: 100.2, node, to: 100 })

    expect(node.scrollLeft).toBe(100)
    expect(frames).toHaveLength(0)
  })

  test('cancel stops further frames', () => {
    const node = { scrollLeft: 0 }
    const glide = startScrollGlide({ durationMs: 200, from: 0, node, to: 100 })

    runFrame(0)
    runFrame(50)
    const frozen = node.scrollLeft
    glide.cancel()

    runFrame(100)
    expect(node.scrollLeft).toBe(frozen)
    expect(frames).toHaveLength(0)
  })
})
