import { useAtom } from '@reatom/npm-react'
import { useCallback, useEffect, useRef } from 'react'
import { Dimensions } from 'react-native'
import { onboardingTargetRectsAtom } from '../model/targets'
import { getTourScrollable, isRectOutsideViewport, scrollOffsetFor } from './tourScrollable'

// Two bounded re-measure attempts after an auto-scroll; no endless retry loop.
const RESCROLL_DELAYS_MS = [300, 700]

interface TargetAutoScrollInput {
  bottomInset: number
  id: string
  isActive: boolean
  measure: () => void
}

export const useTargetAutoScroll = ({
  bottomInset,
  id,
  isActive,
  measure,
}: TargetAutoScrollInput) => {
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const rect = rects[id]
  const hasScrolledRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    if (!isActive) {
      // Deactivation (step change / tour end) is the per-activation reset point:
      // the next false→true toggle scrolls again.
      clearTimers()
      hasScrolledRef.current = false
      return
    }

    if (hasScrolledRef.current || rect === undefined) return

    const viewportHeight = Dimensions.get('window').height
    if (!isRectOutsideViewport(rect, viewportHeight, bottomInset)) return

    const scrollable = getTourScrollable()
    if (scrollable === null) return

    hasScrolledRef.current = true
    scrollable.scrollTo(scrollOffsetFor(rect, viewportHeight), true)
    timersRef.current = RESCROLL_DELAYS_MS.map(delay => setTimeout(measure, delay))
  }, [bottomInset, clearTimers, isActive, measure, rect])
}
