import { useCallback, useEffect, useRef } from 'react'
import { hapticLight } from 'shared/lib/haptics'
import { type SeekDirection } from './keyboardTargetGuards'

const EDGE_TAP_WINDOW_MS = 300

// YouTube-style accumulating double-tap: the first tap of a burst only arms the
// gesture, every following tap inside EDGE_TAP_WINDOW_MS adds one more ±10s step.
export const useEdgeTapSeek = (tapSeek: (direction: SeekDirection) => void) => {
  const lastTapAtRef = useRef<Record<SeekDirection, number>>({ backward: 0, forward: 0 })
  const tapSeekRef = useRef(tapSeek)

  useEffect(() => {
    tapSeekRef.current = tapSeek
  })

  const handleEdgeTap = useCallback((direction: SeekDirection) => {
    const now = Date.now()
    const isWithinBurst = now - lastTapAtRef.current[direction] <= EDGE_TAP_WINDOW_MS
    lastTapAtRef.current[direction] = now
    if (!isWithinBurst) return
    hapticLight()
    tapSeekRef.current(direction)
  }, [])

  return { handleEdgeTap }
}
