import { computeFlingVelocity, projectFlingTarget, type ScrollSample } from './webSliderFling'

const DRAG_ENGAGE_PX = 2

const VELOCITY_WINDOW_MS = 100

interface SliderTouchContext {
  cancelGlide: () => void
  getMaxTravelPx: () => number
  getOffsets: () => number[]
  glideTo: (from: number, to: number) => void
}

/**
 * Wires the horizontal touch physics onto the scroll node. The browser owns
 * direction arbitration (touch-action: pan-y), so touchmove is never
 * preventDefault-ed and vertical pans still reach the page.
 * @param node - Scrollable node of the slider.
 * @param context - Glide and snap state accessors.
 * @returns Cleanup that removes every listener and stops a glide.
 */
export const attachSliderTouch = (node: HTMLElement, context: SliderTouchContext) => {
  let engaged = false
  let samples: ScrollSample[] = []
  let startClientX = 0
  let startScrollLeft = 0

  const handleStart = (event: TouchEvent) => {
    context.cancelGlide()
    const touch = event.touches[0]
    if (!touch) return
    startClientX = touch.clientX
    startScrollLeft = node.scrollLeft
    engaged = false
    samples = []
  }

  const handleMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    const deltaX = touch.clientX - startClientX
    if (!engaged && Math.abs(deltaX) <= DRAG_ENGAGE_PX) return
    engaged = true
    // Палец снова движется — флинг/докрутка не должны перебивать драг 1:1.
    context.cancelGlide()
    node.scrollLeft = startScrollLeft - deltaX
    samples.push({ scrollLeft: node.scrollLeft, time: event.timeStamp })
    samples = samples.filter(sample => event.timeStamp - sample.time <= VELOCITY_WINDOW_MS)
  }

  const release = () => {
    if (!engaged) return
    engaged = false
    const velocity = computeFlingVelocity(samples)
    samples = []
    context.glideTo(
      node.scrollLeft,
      projectFlingTarget({
        maxTravelPx: context.getMaxTravelPx(),
        offsets: context.getOffsets(),
        scrollLeft: node.scrollLeft,
        velocity,
      }),
    )
  }

  const handleCancel = () => {
    engaged = false
    samples = []
  }

  const handleWheel = () => context.cancelGlide()

  node.addEventListener('touchstart', handleStart)
  node.addEventListener('touchmove', handleMove, { passive: true })
  node.addEventListener('touchend', release)
  node.addEventListener('touchcancel', handleCancel)
  node.addEventListener('wheel', handleWheel)
  return () => {
    node.removeEventListener('touchstart', handleStart)
    node.removeEventListener('touchmove', handleMove)
    node.removeEventListener('touchend', release)
    node.removeEventListener('touchcancel', handleCancel)
    node.removeEventListener('wheel', handleWheel)
    context.cancelGlide()
  }
}
