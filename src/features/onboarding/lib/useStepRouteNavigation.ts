import { usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { type OnboardingScenario, resolveStepRoute } from './scenarios'

/**
 * Keeps the router on the active step's effective route (the step's own `route`,
 * or the nearest preceding one) and exposes the current pathname so the overlay
 * can hide itself while the real transition plays out.
 * @param scenario - Active tour scenario, or `undefined` without a tour.
 * @param stepIndex - Active step index, or `undefined` without a tour.
 */
export const useStepRouteNavigation = (
  scenario: OnboardingScenario | undefined,
  stepIndex: number | undefined,
) => {
  const router = useRouter()
  const pathname = usePathname()
  const effectiveRoute =
    scenario === undefined || stepIndex === undefined
      ? undefined
      : resolveStepRoute(scenario, stepIndex)

  useEffect(() => {
    if (effectiveRoute === undefined) return

    if (pathname !== effectiveRoute) router.navigate(effectiveRoute)
  }, [effectiveRoute, pathname, router])

  return { effectiveRoute, pathname }
}
