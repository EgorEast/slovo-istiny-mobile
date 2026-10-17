import { action, atom } from '@reatom/framework'

export interface OnboardingTargetRect {
  height: number
  width: number
  x: number
  y: number
}

// Rects are keyed by target id, then by the measuring instance's id. One target id
// (e.g. the app-wide «?» button) is mounted by many components at once, so every
// instance owns its own entry and a hidden screen cannot clobber the visible one.
// A selection helper (lib/tourHole.ts) then picks the on-screen rect for an id.
export const onboardingTargetRectsAtom = atom<Record<string, Record<string, OnboardingTargetRect>>>(
  {},
  'onboardingTargetRectsAtom',
)

export const onboardingScrollEpochAtom = atom(0, 'onboardingScrollEpochAtom')

// Increments after a tour-initiated scroll settles: targets that could not measure
// while clipped (below the fold) get a re-measure wave once they are visible.
export const bumpOnboardingScrollEpoch = action(ctx => {
  onboardingScrollEpochAtom(ctx, ctx.get(onboardingScrollEpochAtom) + 1)
}, 'bumpOnboardingScrollEpoch')

const isSameRect = (a: OnboardingTargetRect, b: OnboardingTargetRect) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

// A `null` rect releases one instance's entry: an unmounted instance must leave no
// rect behind, or the `skipIfMissing` instant-skip mistakes a closed surface for a
// rendered one. The id key survives while another instance still holds a rect.
export const registerOnboardingTargetRect = action(
  (ctx, payload: { id: string; instanceId: string; rect: null | OnboardingTargetRect }) => {
    const rects = ctx.get(onboardingTargetRectsAtom)
    const perId = rects[payload.id]

    if (payload.rect === null) {
      if (perId === undefined) return

      const remainingInstances = { ...perId }
      delete remainingInstances[payload.instanceId]

      if (Object.keys(remainingInstances).length === 0) {
        const remaining = { ...rects }
        delete remaining[payload.id]
        onboardingTargetRectsAtom(ctx, remaining)
        return
      }

      onboardingTargetRectsAtom(ctx, { ...rects, [payload.id]: remainingInstances })
      return
    }

    const existing = perId?.[payload.instanceId]
    // Repeated measurements of a settled target are the common case (the bounded
    // re-measure schedule), so skip the write when this instance's rect is unchanged.
    if (existing !== undefined && isSameRect(existing, payload.rect)) return

    onboardingTargetRectsAtom(ctx, {
      ...rects,
      [payload.id]: { ...perId, [payload.instanceId]: payload.rect },
    })
  },
  'registerOnboardingTargetRect',
)
