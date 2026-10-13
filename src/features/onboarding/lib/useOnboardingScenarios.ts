import { useFeatureFlag } from 'entities/feature-flags'
import { resolveScenarioScope, scenarios, type ScenarioScope } from './scenarios'

export const useOnboardingScenarios = (scope: ScenarioScope = 'default') => {
  const hasReadAccess = useFeatureFlag('read')
  const hasStudyAccess = useFeatureFlag('study')

  return scenarios.filter(scenario => {
    if (resolveScenarioScope(scenario) !== scope) return false
    if (scenario.featureFlag === 'read') return hasReadAccess
    if (scenario.featureFlag === 'study') return hasStudyAccess
    return true
  })
}
