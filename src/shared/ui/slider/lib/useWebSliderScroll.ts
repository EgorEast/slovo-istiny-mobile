import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { useDebounce } from '../../../lib/hooks/useDebounce'
import { getGlideDurationMs, type ScrollGlide, startScrollGlide } from './webScrollGlide'
import { findNearestOffset } from './webSliderFling'
import { attachSliderTouch } from './webSliderTouch'

const SNAP_DELAY_MS = 160

const SNAP_EPSILON_PX = 1

interface ScrollableSlider {
  getScrollableNode?: () => HTMLElement | null
}

interface SliderScrollEvent {
  nativeEvent: { contentOffset: { x: number } }
}

const noop = () => {}

const isScrollableSlider = (instance: unknown): instance is ScrollableSlider =>
  typeof instance === 'object' && instance !== null && 'getScrollableNode' in instance

const resolveNode = (instance: null | ScrollableSlider): HTMLElement | null =>
  instance?.getScrollableNode?.() ?? null

// Web-only: `touch-action: pan-y` убирает лишь нативный горизонтальный пан —
// владельца жеста решает JS-лок по наклону в webSliderTouch (слоп 8px):
// горизонталь ведёт драг 1:1 и флинг до снапа, вертикаль — страница.
export const useWebSliderScroll = (
  snapOffsets: number[],
  maxTravelPx: number,
): {
  onScroll: ((event: SliderScrollEvent) => void) | undefined
  scrollRef: (instance: unknown) => void
} => {
  const offsetsRef = useRef(snapOffsets)
  const maxTravelRef = useRef(maxTravelPx)
  const scrollXRef = useRef(0)
  const nodeRef = useRef<HTMLElement | null>(null)
  const glideRef = useRef<null | ScrollGlide>(null)
  const [node, setNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    offsetsRef.current = snapOffsets
  }, [snapOffsets])

  useEffect(() => {
    maxTravelRef.current = maxTravelPx
  }, [maxTravelPx])

  const cancelGlide = useCallback(() => {
    glideRef.current?.cancel()
    glideRef.current = null
  }, [])

  const glideTo = useCallback((from: number, to: number) => {
    const targetNode = nodeRef.current
    if (!targetNode) return
    glideRef.current?.cancel()
    glideRef.current = startScrollGlide({
      durationMs: getGlideDurationMs(to - from),
      from,
      node: targetNode,
      to,
    })
  }, [])

  // Reads refs only, so the debounced action keeps a stable identity.
  const snapQuietly = useDebounce(
    () => {
      const nearest = findNearestOffset(scrollXRef.current, offsetsRef.current)
      if (nearest === null) return
      if (Math.abs(nearest - scrollXRef.current) <= SNAP_EPSILON_PX) return
      if (!nodeRef.current) return
      glideTo(nodeRef.current.scrollLeft, nearest)
    },
    SNAP_DELAY_MS,
    [glideTo],
  )

  useEffect(() => {
    if (Platform.OS !== 'web' || !node) return
    return attachSliderTouch(node, {
      cancelGlide,
      getMaxTravelPx: () => maxTravelRef.current,
      getOffsets: () => offsetsRef.current,
      glideTo,
    })
  }, [cancelGlide, glideTo, node])

  const scrollRef = useCallback((instance: unknown) => {
    const resolved = resolveNode(isScrollableSlider(instance) ? instance : null)
    nodeRef.current = resolved
    setNode(resolved)
  }, [])

  const onScroll = useCallback(
    (event: SliderScrollEvent) => {
      scrollXRef.current = event.nativeEvent.contentOffset.x
      snapQuietly()
    },
    [snapQuietly],
  )

  // Native FlatList owns snapping (snapToOffsets); the JS physics is web-only.
  if (Platform.OS !== 'web') return { onScroll: undefined, scrollRef: noop }

  return { onScroll, scrollRef }
}
