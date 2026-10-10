import { useCallback, useEffect, useRef } from 'react'

// Window during which a repeated navigation is treated as an accidental
// double-tap and swallowed. Long enough to cover a fast double tap, short
// enough that a deliberate second tap still navigates.
export const NAVIGATION_GUARD_MS = 350

/**
 * Collapses rapid repeated navigations into one. The returned function runs a
 * navigation immediately, then ignores every call that arrives within
 * `guardMs`; the lock clears on a timeout and on unmount. Shared by every
 * entry point that pushes the playlist screen, so a double-tap never stacks
 * two copies of it.
 * @param guardMs - Suppression window after an accepted navigation, in ms.
 * @returns Guarded runner: pass the navigation to perform.
 */
export const useNavigationGuard = (guardMs: number = NAVIGATION_GUARD_MS) => {
  const isLockedRef = useRef(false)
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return useCallback(
    (navigate: () => void) => {
      if (isLockedRef.current) return

      isLockedRef.current = true
      navigate()
      timerRef.current = setTimeout(() => {
        isLockedRef.current = false
      }, guardMs)
    },
    [guardMs],
  )
}
