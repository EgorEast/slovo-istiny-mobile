import { createCtx } from '@reatom/framework'
import { onboardingTargetRectsAtom, registerOnboardingTargetRect } from './targets'

const RECT = { height: 4, width: 3, x: 1, y: 2 }

describe('onboarding targets model', () => {
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

  test('registering a null rect releases the target', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'b', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'a', rect: null })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({ b: RECT })
  })

  test('releasing an unknown target leaves the registry untouched', () => {
    const ctx = createCtx()
    const settledRects = ctx.get(onboardingTargetRectsAtom)

    registerOnboardingTargetRect(ctx, { id: 'missing', rect: null })

    expect(ctx.get(onboardingTargetRectsAtom)).toBe(settledRects)
  })
})
