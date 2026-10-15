import { type OnboardingStep } from './scenarios'

const DEFAULT_WAIT_HINT = 'Выполните действие, чтобы продолжить'
// Passive waits (a background load, not a user action) explain themselves instead of
// telling the user to act.
const PASSIVE_WAIT_HINTS: Partial<Record<NonNullable<OnboardingStep['waitFor']>, string>> = {
  offlineLoaded: 'Загружаем офлайн-кэш…',
}

// The hint shown while an interactive step's wait condition is unmet.
export const resolveWaitHint = (waitFor: OnboardingStep['waitFor']) =>
  waitFor === undefined ? DEFAULT_WAIT_HINT : (PASSIVE_WAIT_HINTS[waitFor] ?? DEFAULT_WAIT_HINT)
