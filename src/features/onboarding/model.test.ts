import { createCtx } from '@reatom/framework'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingTargetRectsAtom,
  onboardingTourAtom,
  registerOnboardingTargetRect,
  startOnboardingTour,
} from './model'

const RECT = { height: 4, width: 3, x: 1, y: 2 }

describe('onboarding model', () => {
  test('start sets the first step and wipes previous target rects', () => {
    const ctx = createCtx()
    onboardingTargetRectsAtom(ctx, { target: RECT })

    startOnboardingTour(ctx, 'listen')

    expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'listen', stepIndex: 0 })
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('register adds and overwrites a target rect', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'b', rect: { height: 8, width: 7, x: 5, y: 6 } })
    registerOnboardingTargetRect(ctx, { id: 'a', rect: { height: 4, width: 3, x: 9, y: 9 } })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({
      a: { height: 4, width: 3, x: 9, y: 9 },
      b: { height: 8, width: 7, x: 5, y: 6 },
    })
  })

  test('next advances and clamps at the last step', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'study')

    goToNextOnboardingStep(ctx)
    goToNextOnboardingStep(ctx)
    goToNextOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'study', stepIndex: 1 })
  })

  test('prev goes back and clamps at the first step', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen')
    goToNextOnboardingStep(ctx)

    goToPrevOnboardingStep(ctx)
    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'listen', stepIndex: 0 })
  })

  test('next and prev are no-ops without an active tour', () => {
    const ctx = createCtx()

    goToNextOnboardingStep(ctx)
    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('end clears the tour and the rects', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen')
    registerOnboardingTargetRect(ctx, { id: 'a', rect: RECT })

    endOnboardingTour(ctx)

    expect(ctx.get(onboardingTourAtom)).toBeNull()
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })
})
