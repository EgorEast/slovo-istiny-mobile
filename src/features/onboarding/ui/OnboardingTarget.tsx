import { useAction, useAtom } from '@reatom/npm-react'
import { type PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { scenariosById } from '../lib/scenarios'
import { onboardingTourAtom, registerOnboardingTargetRect } from '../model'

const MEASURE_DELAY_MS = 100

export const OnboardingTarget = ({ children, id }: PropsWithChildren<{ id: string }>) => {
  const ref = useRef<View>(null)
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

  return (
    <View ref={ref} collapsable={false} onLayout={isActive ? measure : undefined}>
      {children}
    </View>
  )
}
