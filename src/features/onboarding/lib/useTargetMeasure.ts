import { useAction, useAtom } from '@reatom/npm-react'
import { useNavigation } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { type View } from 'react-native'
import { onboardingTourAtom, registerOnboardingTargetRect } from '../model'
import { scenariosById } from './scenarios'

const MEASURE_DELAY_MS = 100

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
  const navigation = useNavigation<TransitionEndNavigation>()
  const [tour] = useAtom(onboardingTourAtom)
  const register = useAction(registerOnboardingTargetRect)

  const activeTargetId = tour
    ? scenariosById[tour.scenarioId].steps[tour.stepIndex]?.targetId
    : undefined
  const isActive = activeTargetId === id
  const isTourActive = tour !== null

  const measure = useCallback(() => {
    getNode()?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) register({ id, rect: { height, width, x, y } })
    })
  }, [getNode, id, register])

  // Register every mounted target once the tour starts — a tap hint may reference
  // a target that is not the active step's own target. Also re-measure when this
  // target becomes (or stops being) the active step's target so its rect stays
  // fresh across step changes (needed for auto-scroll in both directions).
  useEffect(() => {
    if (!isTourActive && !isActive) return

    const timer = setTimeout(measure, MEASURE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isActive, isTourActive, measure])

  useEffect(() => {
    if (!isActive) return

    return navigation.addListener('transitionEnd', measure)
  }, [isActive, measure, navigation])

  return { isActive, measure }
}
