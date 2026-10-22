import { useCallback, useEffect, useRef } from 'react'
import { type GestureResponderEvent } from 'react-native'
import { hapticLight } from './haptics'

// Early press haptic: fires hapticLight() PRESS_HAPTIC_DELAY_MS after touch-down
// so a tap feels immediate; a gesture becoming a scroll/swipe drops the timer
// first (vibration is uncancellable) — onPressOut or touch drift. Elements with
// onLongPress skip it: their feedback stays end-of-gesture (tap/menu).
export const PRESS_HAPTIC_DELAY_MS = 120

// Below the ~10px scroll slop of ScrollView, so movement kills the timer before
// a scroll claim (a swipe starts moving within the first frames). A wiggly tap
// under the threshold falls back to the release haptic via the existing dedup.
export const PRESS_HAPTIC_CANCEL_DRIFT_PX = 6

interface PressPoint {
  x: number
  y: number
}

const readCoordinates = (candidate: unknown): null | PressPoint => {
  if (typeof candidate !== 'object' || candidate === null) return null

  const pageX = 'pageX' in candidate ? candidate.pageX : undefined
  const pageY = 'pageY' in candidate ? candidate.pageY : undefined

  if (typeof pageX !== 'number' || typeof pageY !== 'number') return null

  return { x: pageX, y: pageY }
}

const readFirstTouch = (touches: unknown): null | PressPoint => {
  if (!Array.isArray(touches)) return null

  return readCoordinates(touches[0])
}

// Some platforms (web-synthesized touch events) carry coordinates on the first
// wrapped touch instead of the event itself, so both shapes are accepted. A
// handler invoked without an event (test doubles, synthetic dispatch) is inert.
const readPoint = (event: GestureResponderEvent | null | undefined): null | PressPoint => {
  const nativeEvent: unknown = event?.nativeEvent

  if (typeof nativeEvent !== 'object' || nativeEvent === null) return null

  const direct = readCoordinates(nativeEvent)
  if (direct !== null) return direct

  if ('touches' in nativeEvent) {
    const fromTouches = readFirstTouch(nativeEvent.touches)
    if (fromTouches !== null) return fromTouches
  }

  return 'changedTouches' in nativeEvent ? readFirstTouch(nativeEvent.changedTouches) : null
}

/**
 * Press feedback for a shared button primitive: one light haptic per gesture,
 * fired while the finger is still down. `onPressIn` schedules it, the early pulse
 * is dropped by `onPressOut` (scroll claim / release) OR by touch drift greater
 * than PRESS_HAPTIC_CANCEL_DRIFT_PX (movement means the gesture is becoming a
 * swipe), whichever comes first, and `shouldSkipHaptic` tells the later `onPress`
 * that the early pulse already happened. The pending timer dies with the
 * component. A disabled element and a long-press element (which keeps
 * end-of-gesture feedback) never schedule the early pulse.
 * @param options - Press feedback switches.
 * @param options.enabled - Whether the element may vibrate at all.
 * @param options.hasLongPress - Long-press elements keep end-of-gesture feedback.
 */
export const usePressHaptic = (options: { enabled: boolean; hasLongPress: boolean }) => {
  const { enabled, hasLongPress } = options
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null)
  const didFireRef = useRef(false)
  const startRef = useRef<null | PressPoint>(null)

  const cancelTimer = useCallback(() => {
    if (timerRef.current === null) return

    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(
    () => () => {
      cancelTimer()
    },
    [cancelTimer],
  )

  const onPressIn = useCallback(
    (event?: GestureResponderEvent) => {
      didFireRef.current = false
      cancelTimer()
      startRef.current = readPoint(event)

      if (!enabled || hasLongPress) return

      timerRef.current = setTimeout(() => {
        timerRef.current = null
        didFireRef.current = true
        hapticLight()
      }, PRESS_HAPTIC_DELAY_MS)
    },
    [cancelTimer, enabled, hasLongPress],
  )

  const onTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (timerRef.current === null) return

      const start = startRef.current
      if (start === null) return

      const current = readPoint(event)
      if (current === null) return

      if (Math.hypot(current.x - start.x, current.y - start.y) > PRESS_HAPTIC_CANCEL_DRIFT_PX)
        cancelTimer()
    },
    [cancelTimer],
  )

  const onPressOut = useCallback(() => {
    cancelTimer()
  }, [cancelTimer])

  const shouldSkipHaptic = useCallback(() => didFireRef.current, [])

  return { onPressIn, onPressOut, onTouchMove, shouldSkipHaptic }
}
