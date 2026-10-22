import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { useDebounce } from '../../../lib/hooks/useDebounce'

const SNAP_DELAY_MS = 160

const SNAP_EPSILON_PX = 1

interface ScrollableSlider {
  scrollToOffset?: (params: { animated?: boolean; offset: number }) => void
}

interface SliderScrollEvent {
  nativeEvent: { contentOffset: { x: number } }
}

const noop = () => {}

const isScrollableSlider = (instance: unknown): instance is ScrollableSlider =>
  typeof instance === 'object' && instance !== null && 'scrollToOffset' in instance

// RNW 0.21 отбрасывает snapToOffsets (и momentum-событий нет) — снапим из JS по
// «тишине» скролла. Преждевременный снап при паузе мышиного драга не страшен:
// следующий pointermove (useMouseDragScroll) перезапишет scrollLeft.
export const useWebSnapScroll = (
  snapOffsets: number[],
): {
  onScroll: ((event: SliderScrollEvent) => void) | undefined
  scrollRef: (instance: unknown) => void
} => {
  const snapOffsetsRef = useRef(snapOffsets)

  useEffect(() => {
    snapOffsetsRef.current = snapOffsets
  }, [snapOffsets])

  const scrollableRef = useRef<null | ScrollableSlider>(null)
  const scrollXRef = useRef(0)

  // Reads refs only, so the debounced action keeps a stable identity and never
  // captures a stale offsets array.
  const snapToNearest = useDebounce(
    () => {
      const scrollable = scrollableRef.current
      const offsets = snapOffsetsRef.current
      if (!scrollable?.scrollToOffset || offsets.length === 0) return

      const nearest = offsets.reduce((closest, offset) =>
        Math.abs(offset - scrollXRef.current) < Math.abs(closest - scrollXRef.current)
          ? offset
          : closest,
      )
      if (Math.abs(nearest - scrollXRef.current) <= SNAP_EPSILON_PX) return

      scrollable.scrollToOffset({ animated: true, offset: nearest })
    },
    SNAP_DELAY_MS,
    [],
  )

  const scrollRef = useCallback((instance: unknown) => {
    scrollableRef.current = isScrollableSlider(instance) ? instance : null
  }, [])

  const onScroll = useCallback(
    (event: SliderScrollEvent) => {
      scrollXRef.current = event.nativeEvent.contentOffset.x
      snapToNearest()
    },
    [snapToNearest],
  )

  // Native FlatList owns snapping (snapToOffsets); the JS snap is web-only.
  if (Platform.OS !== 'web') return { onScroll: undefined, scrollRef: noop }

  return { onScroll, scrollRef }
}
