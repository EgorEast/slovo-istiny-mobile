import { createCtx } from '@reatom/framework'
import { onboardingTargetRectsAtom, registerOnboardingTargetRect } from './targets'

const RECT = { height: 4, width: 3, x: 1, y: 2 }
const OTHER_RECT = { height: 8, width: 7, x: 5, y: 6 }

describe('onboarding targets model', () => {
  test('register adds and overwrites a target rect per instance', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a2', rect: OTHER_RECT })
    registerOnboardingTargetRect(ctx, {
      id: 'a',
      instanceId: 'a1',
      rect: { height: 4, width: 3, x: 9, y: 9 },
    })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({
      a: {
        a1: { height: 4, width: 3, x: 9, y: 9 },
        a2: OTHER_RECT,
      },
    })
  })

  test('releasing one instance keeps the other instances of the same target', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a2', rect: OTHER_RECT })
    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: null })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({ a: { a2: OTHER_RECT } })
  })

  test('releasing the last instance removes the target id key', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: null })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('does not rewrite the registry when an instance rect is unchanged', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: RECT })
    const settledRects = ctx.get(onboardingTargetRectsAtom)

    registerOnboardingTargetRect(ctx, { id: 'a', instanceId: 'a1', rect: { ...RECT } })

    expect(ctx.get(onboardingTargetRectsAtom)).toBe(settledRects)
  })

  test('releasing an unknown instance leaves the registry untouched', () => {
    const ctx = createCtx()
    const settledRects = ctx.get(onboardingTargetRectsAtom)

    registerOnboardingTargetRect(ctx, { id: 'missing', instanceId: 'x', rect: null })

    expect(ctx.get(onboardingTargetRectsAtom)).toBe(settledRects)
  })
})
