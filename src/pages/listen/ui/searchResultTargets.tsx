import { type ReactElement } from 'react'
import { OnboardingTarget } from 'features/onboarding'

// Page-owned onboarding wrappers passed into the sermon-search feature as generic
// props, so the feature never imports features/onboarding (dependency inversion).
export const wrapSearchGroupHeader = (header: ReactElement) => (
  <OnboardingTarget id='search-results.group-sermons'>{header}</OnboardingTarget>
)

export const wrapFirstSearchRow = (row: ReactElement) => (
  <OnboardingTarget id='search-results.first-sermon'>{row}</OnboardingTarget>
)
