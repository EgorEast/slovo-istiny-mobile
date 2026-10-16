import { useCallback } from 'react'
import { registerTourScrollable, unregisterTourScrollable } from './tourScrollable'

// A screen's main scrollable is either a ScrollView (`scrollTo({ y })`) or a
// FlatList (`scrollToOffset({ offset })`). Both are accepted so every tour screen
// can register its own scrollable without an adapter. `getInnerViewNode` is optional:
// it anchors the layout fallback's `measureLayout`, but not every node exposes it.
type TourScrollableNode = (
  | { scrollTo: (params: { animated?: boolean; y?: number }) => void }
  | { scrollToOffset: (params: { animated?: boolean; offset: number }) => void }
) & { getInnerViewNode?: () => number }

const scrollNodeTo = (node: TourScrollableNode, y: number, animated: boolean) => {
  if ('scrollTo' in node) {
    node.scrollTo({ animated, y })
    return
  }

  node.scrollToOffset({ animated, offset: y })
}

// The content view's native tag anchors `measureLayout`. Not every node (a jest mock,
// a bare view) exposes it, so resolve defensively instead of trusting the type.
const resolveInnerViewNode = (node: TourScrollableNode): null | number => {
  if (typeof node.getInnerViewNode !== 'function') return null

  try {
    return node.getInnerViewNode() ?? null
  } catch {
    return null
  }
}

/**
 * Attach the returned ref callback to a screen's main scrollable (ScrollView/FlatList)
 * so the onboarding tour can scroll an off-screen target into view. Registers on mount
 * and unregisters on unmount.
 */
export const useTourScrollable = () =>
  useCallback((node: null | TourScrollableNode) => {
    if (node === null) {
      unregisterTourScrollable()
      return
    }

    registerTourScrollable({
      getInnerViewNode: () => resolveInnerViewNode(node),
      scrollTo: (y, animated = true) => scrollNodeTo(node, y, animated),
    })
  }, [])
