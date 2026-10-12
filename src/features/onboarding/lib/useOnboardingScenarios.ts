import { useFeatureFlag } from 'entities/feature-flags'
import { scenarios } from './scenarios'

export const useOnboardingScenarios = () => {
  const hasReadAccess = useFeatureFlag('read')
  const hasStudyAccess = useFeatureFlag('study')

  return scenarios.filter(scenario => {
    if (scenario.sinceVersion !== undefined) return false
    if (scenario.featureFlag === 'read') return hasReadAccess
    if (scenario.featureFlag === 'study') return hasStudyAccess
    return true
  })
}
