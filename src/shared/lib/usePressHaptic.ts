import { useCallback, useEffect, useRef } from 'react'
import { hapticLight } from './haptics'

// Early press haptic: fires hapticLight() PRESS_HAPTIC_DELAY_MS after touch-down
// so a tap feels immediate, but a gesture that becomes a scroll/swipe cancels the
// timer via pressOut before it fires (vibration itself is uncancellable).
// Elements with onLongPress skip the early haptic entirely: their feedback stays
// end-of-gesture (tap at press, context menu at long-press) to avoid double fires.
export const PRESS_HAPTIC_DELAY_MS = 120

/**
 * Press feedback for a shared button primitive: one light haptic per gesture,
 * fired while the finger is still down. `onPressIn` schedules it, `onPressOut`
 * drops a pending schedule (that is how a scroll/swipe stays silent), and
 * `shouldSkipHaptic` tells the later `onPress` that the early pulse already
 * happened. The pending timer dies with the component. A disabled element and
 * a long-press element (which keeps end-of-gesture feedback) never schedule the
 * early pulse.
 * @param options - Press feedback switches.
 * @param options.enabled - Whether the element may vibrate at all.
 * @param options.hasLongPress - Long-press elements keep end-of-gesture feedback.
 */
export const usePressHaptic = (options: { enabled: boolean; hasLongPress: boolean }) => {
  const { enabled, hasLongPress } = options
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null)
  const didFireRef = useRef(false)

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

  const onPressIn = useCallback(() => {
    didFireRef.current = false
    cancelTimer()

    if (!enabled || hasLongPress) return

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      didFireRef.current = true
      hapticLight()
    }, PRESS_HAPTIC_DELAY_MS)
  }, [cancelTimer, enabled, hasLongPress])

  const onPressOut = useCallback(() => {
    cancelTimer()
  }, [cancelTimer])

  const shouldSkipHaptic = useCallback(() => didFireRef.current, [])

  return { onPressIn, onPressOut, shouldSkipHaptic }
}
