import { action, atom } from '@reatom/framework'

export interface OnboardingTargetRect {
  height: number
  width: number
  x: number
  y: number
}

export const onboardingTargetRectsAtom = atom<Record<string, OnboardingTargetRect>>(
  {},
  'onboardingTargetRectsAtom',
)

const isSameRect = (a: OnboardingTargetRect, b: OnboardingTargetRect) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

// A `null` rect releases the target: an unmounted target must leave no rect behind,
// or the `skipIfMissing` instant-skip mistakes a closed surface for a rendered one.
export const registerOnboardingTargetRect = action(
  (ctx, payload: { id: string; rect: null | OnboardingTargetRect }) => {
    const rects = ctx.get(onboardingTargetRectsAtom)
    const existing = rects[payload.id]

    if (payload.rect === null) {
      if (existing === undefined) return
      const remaining = { ...rects }
      delete remaining[payload.id]
      onboardingTargetRectsAtom(ctx, remaining)
      return
    }

    // Repeated measurements of a settled target are the common case (the bounded
    // re-measure schedule), so skip the write when the rect is unchanged.
    if (existing !== undefined && isSameRect(existing, payload.rect)) return

    onboardingTargetRectsAtom(ctx, { ...rects, [payload.id]: payload.rect })
  },
  'registerOnboardingTargetRect',
)
