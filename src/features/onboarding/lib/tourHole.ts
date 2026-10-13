import { INDENTS } from 'shared/ui/theme'
import { type OnboardingTargetRect } from '../model'
import { computeTooltipLayout } from './tooltipPosition'

const TOOLTIP_ESTIMATED_HEIGHT = 230

interface TourHole {
  isWaitingForTarget: boolean
  tooltipTop: number
  visibleHole: null | OnboardingTargetRect
}

interface TourHoleInput {
  activeTargetId: string | undefined
  bottomInset: number
  cardHeight: null | number
  expiredStepKey: null | string
  height: number
  rects: Record<string, OnboardingTargetRect>
  stepKey: string
}

// Resolves the spotlight hole, the waiting state and the tooltip position for the
// active step. A rect that sits fully outside the viewport renders as if missing:
// no hole, centered card — but the real registration still counts as "not pending".
export const resolveTourHole = ({
  activeTargetId,
  bottomInset,
  cardHeight,
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
  const layout = computeTooltipLayout(
    visibleHole,
    cardHeight ?? TOOLTIP_ESTIMATED_HEIGHT,
    height,
    bottomInset,
    INDENTS.high,
  )

  return { isWaitingForTarget, tooltipTop: layout.top, visibleHole }
}
