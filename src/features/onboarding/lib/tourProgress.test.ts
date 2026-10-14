import { type OnboardingStep } from './scenarios'
import { resolveHiddenStepIndexes, resolveTourProgress } from './tourProgress'

const STEPS: OnboardingStep[] = Array.from({ length: 6 }, (_, index) => ({
  text: `text ${index}`,
  title: `title ${index}`,
}))

describe('resolveTourProgress', () => {
  test('counts the whole deck when nothing is skipped', () => {
    expect(resolveTourProgress(STEPS, [], 3)).toEqual({
      displayIndex: 3,
      displayTotal: 6,
      isFirstVisible: false,
      isLastVisible: false,
    })
  })

  test('removes skipped steps from the count and the position', () => {
    expect(resolveTourProgress(STEPS, [1, 4], 3)).toEqual({
      displayIndex: 2,
      displayTotal: 4,
      isFirstVisible: false,
      isLastVisible: false,
    })
  })

  test('marks the first and last surviving steps', () => {
    expect(resolveTourProgress(STEPS, [0, 5], 1)).toMatchObject({
      isFirstVisible: true,
      isLastVisible: false,
    })
    expect(resolveTourProgress(STEPS, [0, 5], 4)).toMatchObject({
      isFirstVisible: false,
      isLastVisible: true,
    })
  })

  test('ignores skipped indexes outside the deck', () => {
    expect(resolveTourProgress(STEPS, [-1, 99], 1).displayTotal).toBe(6)
  })
})

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
