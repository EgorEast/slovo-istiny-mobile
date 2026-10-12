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

export const registerOnboardingTargetRect = action(
  (ctx, payload: { id: string; rect: OnboardingTargetRect }) => {
    onboardingTargetRectsAtom(ctx, {
      ...ctx.get(onboardingTargetRectsAtom),
      [payload.id]: payload.rect,
    })
  },
  'registerOnboardingTargetRect',
)
