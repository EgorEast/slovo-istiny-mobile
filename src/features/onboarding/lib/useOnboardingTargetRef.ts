import { useCallback, useRef } from 'react'
import { type ViewInstance } from 'react-native'
import { useTargetMeasure } from './useTargetMeasure'

/**
 * Measures a target that owns its own positioning, such as an absolutely-positioned
 * animated node, without introducing a wrapper View that would collapse its layout.
 * Attach the returned ref to the node that should be measured.
 * @param id - Target id matching the active scenario step's targetId.
 */
export const useOnboardingTargetRef = (id: string) => {
  const nodeRef = useRef<null | ViewInstance>(null)
  const getNode = useCallback(() => nodeRef.current, [])

  useTargetMeasure({ getNode, id })

  return useCallback((node: null | ViewInstance) => {
    nodeRef.current = node
  }, [])
}
