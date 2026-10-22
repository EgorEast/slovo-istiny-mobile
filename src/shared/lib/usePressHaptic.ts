import { useCallback, useEffect, useRef } from 'react'
import { type GestureResponderEvent } from 'react-native'
import { hapticLight } from './haptics'

// Early press haptic: hapticLight() fires PRESS_HAPTIC_DELAY_MS after touch-down
// so a tap feels immediate (vibration itself cannot be cancelled).
export const PRESS_HAPTIC_DELAY_MS = 120

// Below the ~10px scroll slop of ScrollView, so movement kills the timer before a
// scroll claim; a wiggly tap under the threshold keeps the release haptic instead.
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

// Web-synthesized touch events carry coordinates on the first wrapped touch
// instead of the event itself, so both shapes are accepted (no event → inert).
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
 * fired while the finger is still down. `onPressIn` schedules it; the early pulse
 * is dropped by `onPressOut` (scroll claim / release), by touch drift over
 * PRESS_HAPTIC_CANCEL_DRIFT_PX (a swipe), OR by the `onPress` settle: Android
 * delivers `onPress` BEFORE `onPressOut`, so the 120ms deadline can land between
 * them and pulse after the release haptic (device-proven: press at pressIn+71ms,
 * pulse at pressIn+120ms = +49ms gap). `settlePress` kills that timer and reports
 * whether the early pulse already fired, so the caller skips its own pulse. The
 * pending timer dies with the component; disabled/long-press elements skip it.
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

  const settlePress = useCallback(() => {
    cancelTimer()
    return didFireRef.current
  }, [cancelTimer])

  return { onPressIn, onPressOut, onTouchMove, settlePress }
}
