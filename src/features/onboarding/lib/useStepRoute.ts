import { usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { resolveStepRoute } from './resolveStepRoute'
import { type OnboardingScenario } from './scenarios'

// Resolves the active step's effective route (its own, else the nearest preceding) and
// reports whether the router still has to move there. During an exit transition the
// card is already on screen, so no navigation is needed.
export const useStepRoute = ({
  activeStepIndex,
  isExitPhase,
  scenario,
}: {
  activeStepIndex: number | undefined
  isExitPhase: boolean
  scenario: OnboardingScenario | undefined
}) => {
  const pathname = usePathname()
  const effectiveRoute =
    scenario === undefined || activeStepIndex === undefined
      ? undefined
      : resolveStepRoute(scenario, activeStepIndex)
  const needsNavigation =
    !isExitPhase && effectiveRoute !== undefined && pathname !== effectiveRoute

  return {
    effectiveRoute,
    // An exit visualization performs an action on the screen the card already sits on,
    // so there is no route to reach: the flag stays false, and the tap flow's
    // self-navigation race guard cannot cancel the blink it is about to play.
    isRouteReached: !isExitPhase && effectiveRoute !== undefined && !needsNavigation,
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
