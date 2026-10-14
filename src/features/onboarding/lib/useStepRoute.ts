import { usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { resolveStepRoute } from './resolveStepRoute'
import { type OnboardingScenario } from './scenarios'

// Resolves the active card's effective route (its own, else the nearest preceding) and
// reports whether the router still has to move there. During an exit transition the
// card is already on screen, so no navigation is needed.
export const useStepRoute = ({
  cardIndex,
  isExitPhase,
  scenario,
}: {
  cardIndex: number | undefined
  isExitPhase: boolean
  scenario: OnboardingScenario | undefined
}) => {
  const pathname = usePathname()
  const effectiveRoute =
    scenario === undefined || cardIndex === undefined
      ? undefined
      : resolveStepRoute(scenario, cardIndex)
  const needsNavigation =
    !isExitPhase && effectiveRoute !== undefined && pathname !== effectiveRoute

  return {
    effectiveRoute,
    isRouteReached: effectiveRoute !== undefined && !needsNavigation,
    needsNavigation,
  }
}

// Drives the router to the effective route once the tap hint stops holding navigation.
export const useRouteNavigation = ({
  effectiveRoute,
  holdNavigation,
}: {
  effectiveRoute: ReturnType<typeof resolveStepRoute>
  holdNavigation: boolean
}) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (holdNavigation) return
    if (effectiveRoute === undefined) return

    if (pathname !== effectiveRoute) router.navigate(effectiveRoute)
  }, [effectiveRoute, holdNavigation, pathname, router])
}
