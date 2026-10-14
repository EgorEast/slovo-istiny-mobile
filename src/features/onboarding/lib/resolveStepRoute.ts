import { type Href } from 'expo-router'
import { type OnboardingScenario } from './scenarios'

// A step without its own `route` stays on the screen of the nearest preceding
// step that has one — the tour keeps the user on the screen the step belongs to.
// Returns `undefined` when no step up to `stepIndex` declares a route.
export const resolveStepRoute = (
  scenario: OnboardingScenario,
  stepIndex: number,
): Href | undefined => {
  for (let index = stepIndex; index >= 0; index -= 1) {
    const route = scenario.steps[index].route
    if (route !== undefined) return route
  }

  return undefined
}
