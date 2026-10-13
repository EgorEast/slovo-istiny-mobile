import { useCallback } from 'react'
import { type ScrollView } from 'react-native'
import { registerTourScrollable, unregisterTourScrollable } from './tourScrollable'

/**
 * Attach the returned ref callback to a screen's main scrollable (ScrollView/FlatList)
 * so the onboarding tour can scroll an off-screen target into view. Registers on mount
 * and unregisters on unmount.
 */
export const useTourScrollable = () =>
  useCallback((node: null | ScrollView) => {
    if (node === null) {
      unregisterTourScrollable()
      return
    }

    registerTourScrollable({ scrollTo: (y, animated = true) => node.scrollTo({ animated, y }) })
  }, [])
