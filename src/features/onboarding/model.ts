import { action, atom } from '@reatom/framework'
import { type OnboardingScenarioId, scenariosById } from './lib/scenarios'

export interface OnboardingTargetRect {
  height: number
  width: number
  x: number
  y: number
}

export type OnboardingTourState = { scenarioId: OnboardingScenarioId; stepIndex: number } | null

export const onboardingTourAtom = atom<OnboardingTourState>(null, 'onboardingTourAtom')

export const onboardingTargetRectsAtom = atom<Record<string, OnboardingTargetRect>>(
  {},
  'onboardingTargetRectsAtom',
)

export const startOnboardingTour = action((ctx, scenarioId: OnboardingScenarioId) => {
  onboardingTargetRectsAtom(ctx, {})
  onboardingTourAtom(ctx, { scenarioId, stepIndex: 0 })
}, 'startOnboardingTour')

export const goToNextOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  const lastIndex = scenariosById[tour.scenarioId].steps.length - 1
  onboardingTourAtom(ctx, { ...tour, stepIndex: Math.min(tour.stepIndex + 1, lastIndex) })
}, 'goToNextOnboardingStep')

export const goToPrevOnboardingStep = action(ctx => {
  const tour = ctx.get(onboardingTourAtom)
  if (!tour) return

  onboardingTourAtom(ctx, { ...tour, stepIndex: Math.max(tour.stepIndex - 1, 0) })
}, 'goToPrevOnboardingStep')

export const endOnboardingTour = action(ctx => {
  onboardingTourAtom(ctx, null)
  onboardingTargetRectsAtom(ctx, {})
}, 'endOnboardingTour')

const isSameRect = (a: OnboardingTargetRect, b: OnboardingTargetRect) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

export const registerOnboardingTargetRect = action(
  (ctx, payload: { id: string; rect: OnboardingTargetRect }) => {
    const rects = ctx.get(onboardingTargetRectsAtom)
    const existing = rects[payload.id]
    // Repeated measurements of a settled target are the common case (the bounded
    // re-measure schedule), so skip the write when the rect is unchanged.
    if (existing !== undefined && isSameRect(existing, payload.rect)) return

    onboardingTargetRectsAtom(ctx, { ...rects, [payload.id]: payload.rect })
  },
  'registerOnboardingTargetRect',
)
