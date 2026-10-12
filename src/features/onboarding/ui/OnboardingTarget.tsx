import { useAction, useAtom } from '@reatom/npm-react'
import { useNavigation } from 'expo-router'
import { type PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { scenariosById } from '../lib/scenarios'
import { onboardingTourAtom, registerOnboardingTargetRect } from '../model'

const MEASURE_DELAY_MS = 100

// Expo Router's default navigation type exposes only core events; the native stack
// emits `transitionEnd`, so narrow the hook return to the slice of the API we use.
interface TransitionEndNavigation {
  addListener: (event: 'transitionEnd', listener: () => void) => () => void
}

export const OnboardingTarget = ({ children, id }: PropsWithChildren<{ id: string }>) => {
  const ref = useRef<View>(null)
  const navigation = useNavigation<TransitionEndNavigation>()
  const [tour] = useAtom(onboardingTourAtom)
  const register = useAction(registerOnboardingTargetRect)

  const activeTargetId = tour
    ? scenariosById[tour.scenarioId].steps[tour.stepIndex]?.targetId
    : undefined
  const isActive = activeTargetId === id

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) register({ id, rect: { height, width, x, y } })
    })
  }, [id, register])

  useEffect(() => {
    if (!isActive) return

    const timer = setTimeout(measure, MEASURE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isActive, measure])

  useEffect(() => {
    if (!isActive) return

    return navigation.addListener('transitionEnd', measure)
  }, [isActive, measure, navigation])

  return (
    <View ref={ref} collapsable={false} onLayout={isActive ? measure : undefined}>
      {children}
    </View>
  )
}
