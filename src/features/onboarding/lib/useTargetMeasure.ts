import { useAction, useAtom } from '@reatom/npm-react'
import { useNavigation } from 'expo-router'
import { useCallback, useEffect, useId } from 'react'
import { type View } from 'react-native'
import { onboardingActiveStepIndexAtom } from '../model/derived'
import { onboardingScrollEpochAtom, registerOnboardingTargetRect } from '../model/targets'
import { onboardingTourAtom } from '../model/tour'
import { scenariosById } from './scenarios'

const MEASURE_DELAY_MS = 100
// The active target is re-measured a bounded number of times after activation:
// async content (lists loading) and the navigation transition shift the layout
// after the first frame, so a single early measurement can land the highlight in
// the wrong place.
const MEASURE_SAMPLE_DELAYS_MS = [100, 500, 1200, 2500]

interface TargetMeasureInput {
  getNode: () => null | View
  id: string
}

// Expo Router's default navigation type exposes only core events; the native stack
// emits `transitionEnd`, so narrow the hook return to the slice of the API we use.
interface TransitionEndNavigation {
  addListener: (event: 'transitionEnd', listener: () => void) => () => void
}

export const useTargetMeasure = ({ getNode, id }: TargetMeasureInput) => {
  // A stable per-instance key: several components share one target id, and each must
  // own its registry entry so no instance overwrites or releases another's rect.
  const instanceId = useId()
  const navigation = useNavigation<TransitionEndNavigation>()
  const [tour] = useAtom(onboardingTourAtom)
  const [activeStepIndex] = useAtom(onboardingActiveStepIndexAtom)
  const [scrollEpoch] = useAtom(onboardingScrollEpochAtom)
  const register = useAction(registerOnboardingTargetRect)

  const activeTargetId =
    tour !== null && activeStepIndex !== null
      ? scenariosById[tour.scenarioId].steps[activeStepIndex]?.targetId
      : undefined
  const isActive = activeTargetId === id
  const isTourActive = tour !== null

  const measure = useCallback(() => {
    getNode()?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) register({ id, instanceId, rect: { height, width, x, y } })
    })
  }, [getNode, id, instanceId, register])

  // Register every mounted target once the tour starts — a tap hint may reference
  // a target that is not the active step's own target.
  useEffect(() => {
    if (isActive || !isTourActive) return

    const timer = setTimeout(measure, MEASURE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isActive, isTourActive, measure])

  // A tour scroll brings clipped targets into view after their single +100 ms measure
  // already failed; the settled-scroll epoch re-measures them so tap hints have rects.
  useEffect(() => {
    if (scrollEpoch === 0 || isActive || !isTourActive) return

    measure()
  }, [isActive, isTourActive, measure, scrollEpoch])

  // The active target re-measures on a bounded schedule so the highlight follows
  // the screen as it settles (async data loads, transition offsets). Timers are
  // cleared when the target deactivates or unmounts.
  useEffect(() => {
    if (!isActive) return

    const timers = MEASURE_SAMPLE_DELAYS_MS.map(delay => setTimeout(measure, delay))
    return () => timers.forEach(clearTimeout)
  }, [isActive, measure])

  useEffect(() => {
    if (!isActive) return

    return navigation.addListener('transitionEnd', measure)
  }, [isActive, measure, navigation])

  // Unmount releases this instance's rect so the registry only ever reflects mounted
  // instances: a stale rect from a closed surface would otherwise let the
  // `skipIfMissing` instant-skip drop a step whose target is merely not measured yet.
  useEffect(() => () => register({ id, instanceId, rect: null }), [id, instanceId, register])

  return { isActive, measure }
}
