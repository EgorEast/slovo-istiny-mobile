import { type OnboardingTargetRect } from '../model'

export const TOOLTIP_ESTIMATED_HEIGHT = 230

interface TourHole {
  holes: OnboardingTargetRect[]
  isWaitingForTarget: boolean
}

interface TourHoleInput {
  activeTargetId: string | undefined
  expiredStepKey: null | string
  height: number
  rects: Record<string, OnboardingTargetRect>
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
  const hole = activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)
  const isRectOutsideViewport = hole !== null && (hole.y >= height || hole.y + hole.height <= 0)
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
  rects: Record<string, OnboardingTargetRect>,
): AreaRect[] =>
  (areaTargetIds ?? []).flatMap(id => {
    const rect = rects[id]
    return rect === undefined ? [] : [{ id, rect }]
  })
