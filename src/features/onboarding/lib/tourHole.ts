import { type OnboardingTargetRect } from '../model/targets'

export const TOOLTIP_ESTIMATED_HEIGHT = 230

// A rect is on screen while any part of it sits inside the vertical viewport: fully
// below the fold or fully above the top edge makes it off screen.
export const isTargetRectOnScreen = (rect: OnboardingTargetRect, windowHeight: number): boolean =>
  !(rect.y >= windowHeight || rect.y + rect.height <= 0)

// Picks the rect that represents one target id: the first on-screen instance wins, so
// an off-screen instance of a shared id (a hidden screen's «?» button) cannot clobber
// the visible one. When every instance is off screen the first still stands in — the
// caller then degrades to "no hole" with the card shown, not a missing-target wait.
export const pickOnboardingTargetRect = (
  perIdRects: Record<string, OnboardingTargetRect>,
  windowHeight: number,
): OnboardingTargetRect | undefined => {
  const entries = Object.values(perIdRects)
  if (entries.length === 0) return undefined

  const onScreen = entries.filter(rect => isTargetRectOnScreen(rect, windowHeight))

  return onScreen[0] ?? entries[0]
}

interface TourHole {
  holes: OnboardingTargetRect[]
  isWaitingForTarget: boolean
}

interface TourHoleInput {
  activeTargetId: string | undefined
  expiredStepKey: null | string
  height: number
  rects: Record<string, Record<string, OnboardingTargetRect>>
  stepKey: string
}

// Resolves the spotlight holes and the waiting state for the active target step.
// A rect that sits fully outside the viewport renders as if missing: no hole, card
// centered — but the real registration still counts as "not pending".
export const resolveTourHole = ({
  activeTargetId,
  expiredStepKey,
  height,
  rects,
  stepKey,
}: TourHoleInput): TourHole => {
  const hole =
    activeTargetId === undefined
      ? null
      : (pickOnboardingTargetRect(rects[activeTargetId] ?? {}, height) ?? null)
  const isRectOutsideViewport = hole !== null && !isTargetRectOnScreen(hole, height)
  const visibleHole = isRectOutsideViewport ? null : hole
  const isTargetWaitExpired = expiredStepKey === stepKey
  const isWaitingForTarget = activeTargetId !== undefined && hole === null && !isTargetWaitExpired

  return { holes: visibleHole === null ? [] : [visibleHole], isWaitingForTarget }
}

// A highlighted zone's registered rect paired with its target id, in declaration
// order. Shared by the spotlight holes and the pass-through layer's fills.
export interface AreaRect {
  id: string
  rect: OnboardingTargetRect
}

// The rects of a step's highlighted zones, in declaration order, skipping ids whose
// target has not registered yet (the caller renders those as fills/holes as they land).
export const resolveAreaRects = (
  areaTargetIds: string[] | undefined,
  rects: Record<string, Record<string, OnboardingTargetRect>>,
  windowHeight: number,
): AreaRect[] =>
  (areaTargetIds ?? []).flatMap(id => {
    const rect = pickOnboardingTargetRect(rects[id] ?? {}, windowHeight)
    return rect === undefined ? [] : [{ id, rect }]
  })
