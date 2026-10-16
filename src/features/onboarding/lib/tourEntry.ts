import { type Href } from 'expo-router'

// An entry transition is a no-op when its screen is already reached: the card's own
// screen means the whole lead-up is moot (skip the entire phase), this step's screen
// means the tour is already there (skip just this blink/navigation), and a step with
// no route has nothing to navigate to.
export const shouldSkipEntryTransition = (
  pathname: string,
  entryRoute: Href | undefined,
  cardRoute: Href | undefined,
): boolean => cardRoute === pathname || entryRoute === undefined || entryRoute === pathname
