import { useAction, useAtom } from '@reatom/npm-react'
import { useCallback, useEffect, useRef } from 'react'
import { Dimensions, useWindowDimensions, type View } from 'react-native'
import { bumpOnboardingScrollEpoch, onboardingTargetRectsAtom } from '../model/targets'
import { pickOnboardingTargetRect } from './tourHole'
import { getTourScrollable, isRectOutsideViewport, scrollOffsetFor } from './tourScrollable'

// Two bounded re-measure attempts after an auto-scroll; no endless retry loop.
const RESCROLL_DELAYS_MS = [300, 700]
// The +100 ms measure has long resolved by then, so a still-missing rect means the
// clipped view cannot measure and the layout fallback must take over.
const FALLBACK_SCROLL_DELAY_MS = 600

interface TargetAutoScrollInput {
  bottomInset: number
  getNode: () => null | View
  id: string
  isActive: boolean
  measure: () => void
}

export const useTargetAutoScroll = ({
  bottomInset,
  getNode,
  id,
  isActive,
  measure,
}: TargetAutoScrollInput) => {
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const { height: windowHeight } = useWindowDimensions()
  const rect = pickOnboardingTargetRect(rects[id] ?? {}, windowHeight)
  const bumpScrollEpoch = useAction(bumpOnboardingScrollEpoch)
  const hasScrolledRef = useRef(false)
  const hasTriedLayoutFallbackRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const latestRectRef = useRef(rect)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  // A pending fallback timer fires after the rect may have registered; the ref lets
  // its stale closure re-check the latest value before doing anything.
  useEffect(() => {
    latestRectRef.current = rect
  }, [rect])

  // The last delay fires after the animated scroll settles: the active target
  // re-measures at its visible position, and the epoch bump wakes non-active targets
  // (e.g. the next entry transition's tap hint) to measure too — a below-fold view
  // whose single +100 ms measure was clipped gets a rect only after the scroll.
  const schedulePostScrollWork = useCallback(() => {
    timersRef.current.push(...RESCROLL_DELAYS_MS.map(delay => setTimeout(measure, delay)))
    timersRef.current.push(
      setTimeout(bumpScrollEpoch, RESCROLL_DELAYS_MS[RESCROLL_DELAYS_MS.length - 1]),
    )
  }, [bumpScrollEpoch, measure])

  // Fallback for a target the window measure never registers (a clipped below-fold view
  // cannot `measureInWindow`): measure it against the scroll container's content view and
  // pull it into view with the same centering offset. Runs once per activation.
  const runLayoutFallback = useCallback(() => {
    if (hasScrolledRef.current || latestRectRef.current !== undefined) return
    if (hasTriedLayoutFallbackRef.current) return

    const scrollable = getTourScrollable()
    const node = getNode()
    const innerTag = scrollable?.getInnerViewNode() ?? null

    hasTriedLayoutFallbackRef.current = true
    if (scrollable === null || node === null || innerTag === null) return

    node.measureLayout(
      innerTag,
      (x, y, width, height) => {
        const viewportHeight = Dimensions.get('window').height
        scrollable.scrollTo(scrollOffsetFor({ height, width, x, y }, viewportHeight), true)
        schedulePostScrollWork()
      },
      () => {},
    )
  }, [getNode, schedulePostScrollWork])

  useEffect(() => {
    if (!isActive) {
      // Deactivation (step change / tour end) is the per-activation reset point:
      // the next false→true toggle scrolls again.
      clearTimers()
      hasScrolledRef.current = false
      hasTriedLayoutFallbackRef.current = false
      return
    }

    if (hasScrolledRef.current || hasTriedLayoutFallbackRef.current) return

    if (rect === undefined) {
      timersRef.current = [
        ...timersRef.current,
        setTimeout(runLayoutFallback, FALLBACK_SCROLL_DELAY_MS),
      ]
      return
    }

    const viewportHeight = Dimensions.get('window').height
    if (!isRectOutsideViewport(rect, viewportHeight, bottomInset)) return

    const scrollable = getTourScrollable()
    if (scrollable === null) return

    hasScrolledRef.current = true
    scrollable.scrollTo(scrollOffsetFor(rect, viewportHeight), true)
    schedulePostScrollWork()
  }, [bottomInset, clearTimers, isActive, rect, runLayoutFallback, schedulePostScrollWork])
}
