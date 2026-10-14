import { useEffect, useState } from 'react'

const MISSING_TARGET_TIMEOUT_MS = 1200

// Holds the card back until the timeout expires for a target that never measured,
// so the spotlight is never shown pointing at nothing. The key is reset when the
// tour ends (stale per-tour UI state).
export const useExpiredStepKey = ({
  activeTargetId,
  isTourActive,
  stepKey,
}: {
  activeTargetId: string | undefined
  isTourActive: boolean
  stepKey: string
}) => {
  const [expiredStepKey, setExpiredStepKey] = useState<null | string>(null)

  useEffect(() => {
    if (activeTargetId === undefined) return

    const timer = setTimeout(() => setExpiredStepKey(stepKey), MISSING_TARGET_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [activeTargetId, stepKey])

  useEffect(() => {
    if (isTourActive) return

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect -- reset stale per-tour UI state when the tour ends
    setExpiredStepKey(null)
  }, [isTourActive])

  return expiredStepKey
}
