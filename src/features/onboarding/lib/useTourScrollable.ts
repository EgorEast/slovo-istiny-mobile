import { useCallback } from 'react'
import { registerTourScrollable, unregisterTourScrollable } from './tourScrollable'

// A screen's main scrollable is either a ScrollView (`scrollTo({ y })`) or a
// FlatList (`scrollToOffset({ offset })`). Both are accepted so every tour screen
// can register its own scrollable without an adapter.
type TourScrollableNode =
  | { scrollTo: (params: { animated?: boolean; y?: number }) => void }
  | { scrollToOffset: (params: { animated?: boolean; offset: number }) => void }

const scrollNodeTo = (node: TourScrollableNode, y: number, animated: boolean) => {
  if ('scrollTo' in node) {
    node.scrollTo({ animated, y })
    return
  }

  node.scrollToOffset({ animated, offset: y })
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

    registerTourScrollable({ scrollTo: (y, animated = true) => scrollNodeTo(node, y, animated) })
  }, [])
