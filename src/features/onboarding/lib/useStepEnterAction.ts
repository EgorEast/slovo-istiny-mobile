import { useEffect, useRef } from 'react'
import { getTourAction } from './tourActions'

/**
 * Performs a step's `actionOnEnterId` once when the step activates — no blink and
 * no auto-advance, so it suits interactive steps that need the live UI prepared
 * (e.g. A dropdown closed before the user acts). A ref keyed by the step guards
 * against a re-render firing it again; ending the tour clears the guard.
 * @param root0 - The active step's enter-action wiring.
 * @param root0.actionOnEnterId - Registered action id to perform, if any.
 * @param root0.isTourActive - Whether a tour is currently running.
 * @param root0.stepKey - Identity of the active step.
 */
export const useStepEnterAction = ({
  actionOnEnterId,
  isTourActive,
  stepKey,
}: {
  actionOnEnterId: string | undefined
  isTourActive: boolean
  stepKey: string
}) => {
  const firedStepRef = useRef<null | string>(null)

  useEffect(() => {
    if (!isTourActive) {
      firedStepRef.current = null
      return
    }
    if (actionOnEnterId === undefined) return
    if (firedStepRef.current === stepKey) return

    firedStepRef.current = stepKey
    getTourAction(actionOnEnterId)?.()
  }, [actionOnEnterId, isTourActive, stepKey])
}
