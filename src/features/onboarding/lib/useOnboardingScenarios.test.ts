import { renderHookWithProviders } from 'shared/mocks'
import { useOnboardingScenarios } from './useOnboardingScenarios'

const mockUseFeatureFlag = jest.fn((_key: string) => false)

jest.mock('entities/feature-flags', () => ({
  useFeatureFlag: (key: string) => mockUseFeatureFlag(key),
}))

const scenarioIds = (scenarios: Array<{ id: string }>) => scenarios.map(scenario => scenario.id)

describe('useOnboardingScenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFeatureFlag.mockImplementation(() => false)
  })

  test('keeps both flagged scenarios when their flags are on', async () => {
    mockUseFeatureFlag.mockImplementation(() => true)

    const { result } = await renderHookWithProviders(() => useOnboardingScenarios())

    expect(scenarioIds(result.current)).toEqual(expect.arrayContaining(['read', 'study']))
  })

  test('drops the read scenario when the read flag is off', async () => {
    mockUseFeatureFlag.mockImplementation((key: string) => key === 'study')

    const { result } = await renderHookWithProviders(() => useOnboardingScenarios())

    expect(scenarioIds(result.current)).not.toContain('read')
    expect(scenarioIds(result.current)).toContain('study')
  })

  test('drops the study scenario when the study flag is off', async () => {
    mockUseFeatureFlag.mockImplementation((key: string) => key === 'read')

    const { result } = await renderHookWithProviders(() => useOnboardingScenarios())

    expect(scenarioIds(result.current)).not.toContain('study')
    expect(scenarioIds(result.current)).toContain('read')
  })

  test('always keeps non-flagged scenarios', async () => {
    const { result } = await renderHookWithProviders(() => useOnboardingScenarios())

    expect(scenarioIds(result.current)).toEqual(
      expect.arrayContaining(['listen', 'playlists', 'history', 'offline', 'settings']),
    )
    expect(scenarioIds(result.current)).not.toContain('read')
    expect(scenarioIds(result.current)).not.toContain('study')
  })
})
