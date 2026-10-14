import { type OnboardingStep } from './scenarios'
import { resolveHiddenStepIndexes } from './tourProgress'

describe('resolveHiddenStepIndexes', () => {
  const SKIP_STEPS: OnboardingStep[] = [
    { skipIfMissing: true, targetId: 'a', text: '', title: '' },
    { skipIfMissing: true, targetId: 'b', text: '', title: '' },
    { skipIfMissing: true, targetId: 'c', text: '', title: '' },
  ]

  test('drops a skipIfMissing step whose target is absent', () => {
    expect(resolveHiddenStepIndexes(SKIP_STEPS, ['a', 'c'])).toEqual([1])
  })

  test('keeps every skipIfMissing target while none of them has registered', () => {
    expect(resolveHiddenStepIndexes(SKIP_STEPS, [])).toEqual([])
  })

  test('ignores steps without skipIfMissing', () => {
    const steps: OnboardingStep[] = [
      { targetId: 'a', text: '', title: '' },
      { skipIfMissing: true, targetId: 'b', text: '', title: '' },
      { skipIfMissing: true, targetId: 'c', text: '', title: '' },
    ]

    expect(resolveHiddenStepIndexes(steps, ['a', 'b'])).toEqual([2])
  })
})
