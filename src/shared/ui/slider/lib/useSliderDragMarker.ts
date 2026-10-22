import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'

const isDomNode = (node: unknown): node is HTMLElement =>
  typeof node === 'object' && node !== null && 'addEventListener' in node

// Web-only: marks the slider row so a touch that starts inside it is not
// captured by the web pull-to-refresh gesture. Тачи, начатые на слайдере, не
// должны захватываться web pull-to-refresh — маркер читается
// `pull-to-refresh.gesture.ts` через `closest('[data-slider-drag]')`.
export const useSliderDragMarker = () => {
  const [node, setNode] = useState<HTMLElement | null>(null)

  const markerRef = useCallback((instance: unknown) => {
    setNode(isDomNode(instance) ? instance : null)
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web' || !node) return
    // eslint-disable-next-line react-hooks/immutability -- DOM side effect: the marker is read by the pull-to-refresh gesture via closest()
    node.dataset.sliderDrag = 'true'
    return () => {
      delete node.dataset.sliderDrag
    }
  }, [node])

  return markerRef
}
