import { useAction } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { startOnboardingTour } from '../model'
import { type OnboardingScenario } from './scenarios'

const TOUR_START_DELAY_MS = 400

export const useStartScenarioTour = () => {
  const router = useRouter()
  const pathname = usePathname()
  const startTour = useAction(startOnboardingTour)
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return (scenario: OnboardingScenario) => {
    if (pathname !== scenario.homeRoute) router.push(scenario.homeRoute)
    timerRef.current = setTimeout(() => startTour(scenario.id), TOUR_START_DELAY_MS)
  }
}
