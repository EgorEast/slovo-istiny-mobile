import { useAtom } from '@reatom/npm-react'
import { useCallback, useEffect, useRef } from 'react'
import { Dimensions } from 'react-native'
import { onboardingTargetRectsAtom } from '../model'
import { getTourScrollable, isBelowFold, scrollOffsetFor } from './tourScrollable'

// Two bounded re-measure attempts after an auto-scroll; no endless retry loop.
const RESCROLL_DELAYS_MS = [300, 700]

interface TargetAutoScrollInput {
  id: string
  isActive: boolean
  measure: () => void
}

export const useTargetAutoScroll = ({ id, isActive, measure }: TargetAutoScrollInput) => {
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
      clearTimers()
      hasScrolledRef.current = false
      return
    }

    if (hasScrolledRef.current || rect === undefined) return

    const viewportHeight = Dimensions.get('window').height
    if (!isBelowFold(rect, viewportHeight, 0)) return

    const scrollable = getTourScrollable()
    if (scrollable === null) return

    hasScrolledRef.current = true
    scrollable.scrollTo(scrollOffsetFor(rect, viewportHeight), true)
    timersRef.current = RESCROLL_DELAYS_MS.map(delay => setTimeout(measure, delay))
  }, [clearTimers, isActive, measure, rect])
}
