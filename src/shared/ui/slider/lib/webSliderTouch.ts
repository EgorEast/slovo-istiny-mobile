import { attachClickGuard } from './webSliderClickGuard'
import { computeFlingVelocity, projectFlingTarget, type ScrollSample } from './webSliderFling'

const SLOP_PX = 8

const DRAG_CLICK_THRESHOLD_PX = 5

const VELOCITY_WINDOW_MS = 100

type DragLock = 'horizontal' | 'none' | 'vertical'

interface SliderTouchContext {
  cancelGlide: () => void
  getMaxTravelPx: () => number
  getOffsets: () => number[]
  glideTo: (from: number, to: number) => void
}

/**
 * Навешивает горизонтальную тач-физику на скролл-узел. CSS `touch-action: pan-y`
 * убирает только нативный горизонтальный пан; эксклюзивность осей даёт JS-лок —
 * наклон жеста решает один раз, кто владеет им до конца: горизонталь остаётся
 * слайдеру (её touchmove не всплывают — pull-to-refresh слеп), вертикаль —
 * странице (нативный скролл и рефреш).
 * @param node - Scrollable node of the slider.
 * @param context - Glide and snap state accessors.
 * @returns Cleanup that removes every listener and stops a glide.
 */
export const attachSliderTouch = (node: HTMLElement, context: SliderTouchContext) => {
  let lock: DragLock = 'none'
  let samples: ScrollSample[] = []
  let startClientX = 0
  let startClientY = 0
  let startScrollLeft = 0
  let movedDistance = 0
  const clickGuard = attachClickGuard(node)

  const handleStart = (event: TouchEvent) => {
    context.cancelGlide()
    // Свежий тач снимает протухший guard: click прошлого свайпа мог уйти мимо узла.
    clickGuard.remove()
    const touch = event.touches[0]
    if (!touch) return
    startClientX = touch.clientX
    startClientY = touch.clientY
    startScrollLeft = node.scrollLeft
    lock = 'none'
    movedDistance = 0
    samples = []
  }

  const handleMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    const deltaX = touch.clientX - startClientX
    const deltaY = touch.clientY - startClientY
    if (lock === 'none') {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SLOP_PX) return
      // Направленный захват — как у нативного FlatList: наклон жеста решает
      // один раз и на весь жест.
      lock = Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'
    }
    if (lock === 'vertical') return
    // Палец снова движется — флинг/докрутка не должны перебивать драг 1:1.
    context.cancelGlide()
    // Pull-to-refresh слушает предка в фазе всплытия — дальше жест ему не виден.
    event.stopPropagation()
    node.scrollLeft = startScrollLeft - deltaX
    movedDistance = Math.max(movedDistance, Math.abs(deltaX))
    if (movedDistance > DRAG_CLICK_THRESHOLD_PX) clickGuard.arm()
    samples.push({ scrollLeft: node.scrollLeft, time: event.timeStamp })
    samples = samples.filter(sample => event.timeStamp - sample.time <= VELOCITY_WINDOW_MS)
  }

  const release = () => {
    const isHorizontal = lock === 'horizontal'
    lock = 'none'
    if (!isHorizontal) {
      samples = []
      return
    }
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
    lock = 'none'
    movedDistance = 0
    samples = []
    clickGuard.remove()
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
    clickGuard.remove()
    context.cancelGlide()
  }
}
